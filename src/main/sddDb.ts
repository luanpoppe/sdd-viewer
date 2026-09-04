import { DatabaseSync } from 'node:sqlite'
import { existsSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'
import type {
  ChangeTimeline,
  ChunkFileEntry,
  CodeHighlight,
  ProjectTimeline,
  TimelineChunk,
  TimelineEvent
} from '@shared/types'
import { normalizeProjectPath } from '@shared/normalizePath'

const EVENT_LIMIT = 200

type ChunkRow = {
  chunk_id: string
  feature_slug: string | null
  title: string | null
  status: string | null
  wave: number | null
  started_at: string | null
  finished_at: string | null
  summary: string | null
  reasoning: string | null
  change_id: string
  file_count: number
}

type EventRow = {
  at: string
  kind: string
  actor: string | null
  summary: string
  change_id: string | null
  chunk_id: string | null
}

// Espelha as colunas de `file_changes`. `detail` pode não existir num banco em
// versão anterior — daí ser opcional aqui, e não `string | null`.
type FileRow = {
  id: number
  path: string
  operation: string | null
  lines_added: number | null
  lines_removed: number | null
  does: string | null
  connects: string | null
  review_note: string | null
  detail?: string | null
  review_order: number | null
  is_test: number
}

type HighlightRow = {
  file_change_pk: number
  label: string | null
  lines: string | null
  language: string | null
  snippet: string
  explanation: string | null
}

/**
 * Leitura do banco global do SDD (`~/.sdd/sdd.db`), gravado pelo MCP local do
 * plugin. É o que permite ao viewer mostrar chunk e arquivo — informação que não
 * existe no markdown de `.sdd/`.
 *
 * Nada aqui é obrigatório: banco ausente, projeto não registrado ou schema mais
 * novo do que o esperado devolvem "indisponível" e o viewer segue idêntico ao que
 * era antes. Todo caminho de erro é silencioso na UI e logado no console.
 */
export class SddDbReader {
  static dbPath(): string {
    return join(homedir(), '.sdd', 'sdd.db')
  }

  static timeline(projectPath: string): ProjectTimeline {
    const db = SddDbReader.open()
    if (!db) return { available: false, changes: [] }

    try {
      const projectId = SddDbReader.findProjectId(db, projectPath)
      if (projectId === null) return { available: false, changes: [] }

      const chunks = SddDbReader.selectChunks(db, projectId)
      const events = SddDbReader.selectEvents(db, projectId)
      return { available: true, changes: SddDbReader.groupByChange(chunks, events) }
    } catch (error) {
      console.error('[sdd-viewer] falha ao ler a timeline do banco do SDD:', error)
      return { available: false, changes: [] }
    } finally {
      db.close()
    }
  }

  static chunkFiles(projectPath: string, changeId: string, chunkId: string): ChunkFileEntry[] {
    const db = SddDbReader.open()
    if (!db) return []

    try {
      const projectId = SddDbReader.findProjectId(db, projectPath)
      if (projectId === null) return []

      // `fc.*` de propósito, e não a lista de colunas: o viewer não é dono deste
      // schema. Nomear `fc.detail` faria a consulta estourar contra um banco que
      // ainda está numa versão anterior à coluna; com `*`, o campo simplesmente vem
      // ausente e cai no `?? undefined` do mapeamento.
      const rows = db
        .prepare(
          `SELECT fc.*
             FROM file_changes fc
             JOIN chunks k ON k.id = fc.chunk_pk
             JOIN changes c ON c.id = k.change_pk
            WHERE c.project_id = ? AND c.change_id = ? AND k.chunk_id = ?
            ORDER BY fc.review_order ASC`
        )
        .all(projectId, changeId, chunkId) as FileRow[]

      const highlights = SddDbReader.selectHighlights(db, rows)
      return rows.map((row) => SddDbReader.toFileEntry(row, highlights.get(row.id) ?? []))
    } catch (error) {
      console.error('[sdd-viewer] falha ao ler os arquivos do chunk:', error)
      return []
    } finally {
      db.close()
    }
  }

  /**
   * Conexão por consulta, não persistente: o banco é minúsculo, as consultas são
   * raras (só quando o usuário abre a aba) e assim o viewer nunca segura um handle
   * enquanto o MCP escreve.
   *
   * Tenta somente-leitura primeiro. Em modo WAL, uma abertura read-only pode falhar
   * quando o arquivo `-shm` ainda não existe — nesse caso cai para leitura-escrita,
   * que só é usada para ler (nenhuma query aqui escreve).
   */
  private static open(): DatabaseSync | null {
    const path = SddDbReader.dbPath()
    if (!existsSync(path)) return null

    try {
      return new DatabaseSync(path, { readOnly: true })
    } catch {
      try {
        return new DatabaseSync(path)
      } catch (error) {
        console.error('[sdd-viewer] não foi possível abrir o banco do SDD:', error)
        return null
      }
    }
  }

  private static findProjectId(db: DatabaseSync, projectPath: string): number | null {
    // `COLLATE NOCASE` porque os dois lados descobrem o caminho por vias diferentes
    // — o MCP pelo diretório de trabalho da sessão, o viewer pelo seletor de pasta —
    // e no Windows a caixa dos segmentos pode divergir para o mesmo projeto.
    const normalized = normalizeProjectPath(projectPath)
    const row = db
      .prepare('SELECT id FROM projects WHERE path = ? COLLATE NOCASE')
      .get(normalized) as { id: number } | undefined
    return row ? row.id : null
  }

  private static selectChunks(db: DatabaseSync, projectId: number): ChunkRow[] {
    return db
      .prepare(
        `SELECT c.change_id, k.chunk_id, f.slug AS feature_slug, k.title, k.status, k.wave,
                k.started_at, k.finished_at, k.summary, k.reasoning,
                (SELECT COUNT(*) FROM file_changes fc WHERE fc.chunk_pk = k.id) AS file_count
           FROM chunks k
           JOIN changes c ON c.id = k.change_pk
           LEFT JOIN features f ON f.id = k.feature_pk
          WHERE c.project_id = ?
          ORDER BY c.change_id ASC, k.finished_at ASC, k.id ASC`
      )
      .all(projectId) as ChunkRow[]
  }

  private static selectEvents(db: DatabaseSync, projectId: number): EventRow[] {
    return db
      .prepare(
        `SELECT e.at, e.kind, e.actor, e.summary, c.change_id, k.chunk_id
           FROM events e
           LEFT JOIN changes c ON c.id = e.change_pk
           LEFT JOIN chunks k ON k.id = e.chunk_pk
          WHERE e.project_id = ?
          ORDER BY e.at DESC, e.id DESC
          LIMIT ?`
      )
      .all(projectId, EVENT_LIMIT) as EventRow[]
  }

  /** Uma entrada por mudança, na ordem em que o SQL já devolveu os chunks. */
  private static groupByChange(chunks: ChunkRow[], events: EventRow[]): ChangeTimeline[] {
    const byChange = new Map<string, ChangeTimeline>()

    const ensure = (changeId: string): ChangeTimeline => {
      const existing = byChange.get(changeId)
      if (existing) return existing
      const created: ChangeTimeline = { changeId, chunks: [], events: [] }
      byChange.set(changeId, created)
      return created
    }

    for (const row of chunks) ensure(row.change_id).chunks.push(SddDbReader.toChunk(row))

    for (const row of events) {
      if (!row.change_id) continue
      ensure(row.change_id).events.push(SddDbReader.toEvent(row))
    }

    return [...byChange.values()]
  }

  private static toChunk(row: ChunkRow): TimelineChunk {
    return {
      chunkId: row.chunk_id,
      featureSlug: row.feature_slug ?? undefined,
      title: row.title ?? undefined,
      status: row.status ?? undefined,
      wave: row.wave ?? undefined,
      startedAt: row.started_at ?? undefined,
      finishedAt: row.finished_at ?? undefined,
      summary: row.summary ?? undefined,
      reasoning: row.reasoning ?? undefined,
      fileCount: Number(row.file_count)
    }
  }

  private static toEvent(row: EventRow): TimelineEvent {
    return {
      at: row.at,
      kind: row.kind,
      actor: row.actor ?? undefined,
      summary: row.summary,
      chunkId: row.chunk_id ?? undefined
    }
  }

  /**
   * Uma consulta só para os destaques de todos os arquivos do chunk, agrupados em
   * memória — evita uma query por arquivo. Devolve mapa vazio quando o banco ainda
   * está num schema anterior a esta tabela.
   */
  private static selectHighlights(
    db: DatabaseSync,
    files: FileRow[]
  ): Map<number, CodeHighlight[]> {
    const grouped = new Map<number, CodeHighlight[]>()
    if (files.length === 0) return grouped

    const placeholders = files.map(() => '?').join(', ')
    const ids = files.map((file) => file.id)

    let rows: HighlightRow[]
    try {
      rows = db
        .prepare(
          `SELECT file_change_pk, label, lines, language, snippet, explanation
             FROM code_highlights
            WHERE file_change_pk IN (${placeholders})
            ORDER BY file_change_pk ASC, position ASC`
        )
        .all(...ids) as HighlightRow[]
    } catch (error) {
      console.error('[sdd-viewer] destaques de código indisponíveis:', error)
      return grouped
    }

    for (const row of rows) {
      const list = grouped.get(row.file_change_pk) ?? []
      list.push({
        label: row.label ?? undefined,
        lines: row.lines ?? undefined,
        language: row.language ?? undefined,
        snippet: row.snippet,
        explanation: row.explanation ?? undefined
      })
      grouped.set(row.file_change_pk, list)
    }

    return grouped
  }

  private static toFileEntry(row: FileRow, highlights: CodeHighlight[]): ChunkFileEntry {
    return {
      path: row.path,
      operation: row.operation ?? undefined,
      linesAdded: row.lines_added ?? undefined,
      linesRemoved: row.lines_removed ?? undefined,
      does: row.does ?? undefined,
      connects: row.connects ?? undefined,
      reviewNote: row.review_note ?? undefined,
      detail: row.detail ?? undefined,
      highlights,
      reviewOrder: row.review_order ?? 0,
      isTest: row.is_test === 1
    }
  }
}
