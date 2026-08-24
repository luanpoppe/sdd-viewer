import { dialog, ipcMain, type BrowserWindow } from 'electron'
import { readFileSync } from 'fs'
import type { ProjectTree, Workspace } from '@shared/types'
import { SddTreeParser } from './sddTree'
import { WorkspaceStore } from './workspaceStore'
import { FileWatcherService } from './fileWatcher'

export function registerIpcHandlers(
  window: BrowserWindow,
  store: WorkspaceStore,
  watcher: FileWatcherService
): void {
  ipcMain.handle('workspaces:list', () => store.list())

  ipcMain.handle('workspaces:add', async (): Promise<Workspace | null> => {
    const result = await dialog.showOpenDialog(window, { properties: ['openDirectory'] })
    if (result.canceled || result.filePaths.length === 0) return null

    const workspace = store.add(result.filePaths[0])
    watcher.watch(workspace)
    return workspace
  })

  ipcMain.handle('workspaces:remove', (_event, workspaceId: string) => {
    watcher.unwatch(workspaceId)
    store.remove(workspaceId)
  })

  ipcMain.handle('sdd:getTree', (_event, workspaceId: string): ProjectTree | null => {
    const workspace = store.list().find((w) => w.id === workspaceId)
    if (!workspace) return null
    return SddTreeParser.parseProject(workspace.id, workspace.name, workspace.path)
  })

  ipcMain.handle('file:read', (_event, path: string) => readFileSync(path, 'utf-8'))
}
