import { contextBridge, ipcRenderer } from 'electron'
import type { ProjectTree, Workspace } from '@shared/types'

const sddApi = {
  listWorkspaces: (): Promise<Workspace[]> => ipcRenderer.invoke('workspaces:list'),
  addWorkspace: (): Promise<Workspace | null> => ipcRenderer.invoke('workspaces:add'),
  removeWorkspace: (workspaceId: string): Promise<void> =>
    ipcRenderer.invoke('workspaces:remove', workspaceId),
  getTree: (workspaceId: string): Promise<ProjectTree | null> =>
    ipcRenderer.invoke('sdd:getTree', workspaceId),
  readFile: (path: string): Promise<string> => ipcRenderer.invoke('file:read', path),

  onFileChanged: (callback: (path: string) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, path: string): void => callback(path)
    ipcRenderer.on('sdd:file-changed', listener)
    return () => ipcRenderer.removeListener('sdd:file-changed', listener)
  },

  onTreeUpdated: (callback: (tree: ProjectTree) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, tree: ProjectTree): void => callback(tree)
    ipcRenderer.on('sdd:tree-updated', listener)
    return () => ipcRenderer.removeListener('sdd:tree-updated', listener)
  }
}

contextBridge.exposeInMainWorld('sdd', sddApi)

export type SddApi = typeof sddApi
