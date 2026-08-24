import chokidar, { FSWatcher } from 'chokidar'
import { join } from 'path'
import type { WebContents } from 'electron'
import type { Workspace } from '@shared/types'
import { SddTreeParser } from './sddTree'

export class FileWatcherService {
  private readonly watchers = new Map<string, FSWatcher>()

  constructor(private readonly webContents: WebContents) {}

  watch(workspace: Workspace): void {
    this.unwatch(workspace.id)

    const sddPath = join(workspace.path, '.sdd')
    const watcher = chokidar.watch(sddPath, { ignoreInitial: true })

    watcher.on('all', (_event, changedPath) => {
      this.webContents.send('sdd:file-changed', changedPath)

      const tree = SddTreeParser.parseProject(workspace.id, workspace.name, workspace.path)
      this.webContents.send('sdd:tree-updated', tree)
    })

    this.watchers.set(workspace.id, watcher)
  }

  unwatch(workspaceId: string): void {
    const watcher = this.watchers.get(workspaceId)
    if (!watcher) return
    watcher.close()
    this.watchers.delete(workspaceId)
  }

  unwatchAll(): void {
    for (const id of this.watchers.keys()) this.unwatch(id)
  }
}
