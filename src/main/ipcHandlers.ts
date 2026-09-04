import { clipboard, dialog, ipcMain, type BrowserWindow } from 'electron'
import { readFileSync } from 'fs'
import type { ChunkFileEntry, ProjectTimeline, ProjectTree, Workspace } from '@shared/types'
import { SddTreeParser } from './sddTree'
import { WorkspaceStore } from './workspaceStore'
import { FileWatcherService } from './fileWatcher'
import { SddDbReader } from './sddDb'

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

  // Leitura do banco do SDD. Caminho paralelo de propósito: não toca em
  // `sdd:getTree` nem em `ProjectTree`, então um banco ausente ou um erro aqui não
  // tem como afetar a árvore de artefatos que o viewer sempre soube mostrar.
  ipcMain.handle('db:timeline', (_event, workspaceId: string): ProjectTimeline => {
    const workspace = store.list().find((w) => w.id === workspaceId)
    if (!workspace) return { available: false, changes: [] }
    return SddDbReader.timeline(workspace.path)
  })

  // Clipboard pelo main, não pelo `navigator.clipboard` do renderer: em produção a
  // janela carrega de `file://`, onde a API do navegador não está disponível.
  ipcMain.handle('clipboard:write', (_event, text: string) => clipboard.writeText(text))

  ipcMain.handle(
    'db:chunkFiles',
    (_event, workspaceId: string, changeId: string, chunkId: string): ChunkFileEntry[] => {
      const workspace = store.list().find((w) => w.id === workspaceId)
      if (!workspace) return []
      return SddDbReader.chunkFiles(workspace.path, changeId, chunkId)
    }
  )
}
