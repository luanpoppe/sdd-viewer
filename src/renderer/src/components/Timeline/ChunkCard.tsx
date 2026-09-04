import { useState } from 'react'
import type { ChunkFileEntry, TimelineChunk } from '@shared/types'
import { FileEntry } from './FileEntry'
import { TimelineFormat } from './format'

export function ChunkCard({
  workspaceId,
  changeId,
  chunk
}: {
  workspaceId: string
  changeId: string
  chunk: TimelineChunk
}) {
  const [expanded, setExpanded] = useState(false)
  const [files, setFiles] = useState<ChunkFileEntry[] | null>(null)

  // Os arquivos só são buscados quando o chunk abre: a timeline pode ter dezenas de
  // chunks, e cada um tem seu próprio bloco Faz/Conecta/Revisar por arquivo.
  const toggle = (): void => {
    const willExpand = !expanded
    setExpanded(willExpand)
    if (!willExpand || files) return

    window.sdd.getChunkFiles(workspaceId, changeId, chunk.chunkId).then(setFiles)
  }

  const duration = TimelineFormat.duration(chunk.startedAt, chunk.finishedAt)

  return (
    <li className="chunk-card">
      <div className="chunk-header" onClick={toggle}>
        <span className="chunk-caret">{expanded ? '▾' : '▸'}</span>
        <span className="chunk-id">{chunk.chunkId}</span>
        <span className="chunk-title">{chunk.title ?? chunk.summary ?? 'sem título'}</span>
        <span className="chunk-meta">
          {chunk.wave !== undefined && <span className="chunk-wave">onda {chunk.wave}</span>}
          <span className="chunk-files">{chunk.fileCount} arq.</span>
          {duration && <span className="chunk-duration">{duration}</span>}
          <span className="chunk-stamp">{TimelineFormat.stamp(chunk.finishedAt)}</span>
        </span>
      </div>

      {expanded && (
        <div className="chunk-body">
          {chunk.summary && <p className="chunk-summary">{chunk.summary}</p>}
          {chunk.reasoning && (
            <p className="chunk-reasoning">
              <strong>Por quê:</strong> {chunk.reasoning}
            </p>
          )}
          <ChunkFiles files={files} />
        </div>
      )}
    </li>
  )
}

function ChunkFiles({ files }: { files: ChunkFileEntry[] | null }) {
  if (files === null) return <div className="chunk-loading">carregando arquivos…</div>
  if (files.length === 0) return <div className="chunk-loading">Nenhum arquivo registrado.</div>

  return (
    <ol className="chunk-file-list">
      {files.map((file) => (
        <FileEntry key={file.path} file={file} />
      ))}
    </ol>
  )
}
