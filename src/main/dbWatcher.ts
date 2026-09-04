import chokidar, { FSWatcher } from 'chokidar'
import { dirname } from 'path'
import type { WebContents } from 'electron'
import { SddDbReader } from './sddDb'

const DEBOUNCE_MS = 300

/**
 * Observa o banco global do SDD e avisa o renderer que a timeline mudou.
 *
 * Separado do `FileWatcherService` porque o escopo é outro: o banco é único para a
 * máquina, não um por workspace. E aqui há debounce — uma escrita do MCP toca o
 * `.db`, o `-wal` e o `-shm` em sequência, o que sem debounce viraria três recargas
 * seguidas.
 *
 * Watcha o diretório e filtra pelo nome porque, em WAL, o `-wal` pode ser recriado:
 * um watcher preso ao arquivo perderia o novo inode.
 */
export class DbWatcherService {
  private watcher: FSWatcher | null = null
  private pending: NodeJS.Timeout | null = null

  constructor(private readonly webContents: WebContents) {}

  start(): void {
    this.stop()

    const dbPath = SddDbReader.dbPath()
    const dbDir = dirname(dbPath)
    this.watcher = chokidar.watch(dbDir, { ignoreInitial: true, depth: 0 })

    this.watcher.on('all', (_event, changedPath) => {
      if (!changedPath.startsWith(dbPath)) return
      this.scheduleNotify()
    })
  }

  stop(): void {
    if (this.pending) {
      clearTimeout(this.pending)
      this.pending = null
    }
    if (!this.watcher) return
    this.watcher.close()
    this.watcher = null
  }

  private scheduleNotify(): void {
    if (this.pending) clearTimeout(this.pending)
    this.pending = setTimeout(() => {
      this.pending = null
      if (this.webContents.isDestroyed()) return
      this.webContents.send('db:updated')
    }, DEBOUNCE_MS)
  }
}
