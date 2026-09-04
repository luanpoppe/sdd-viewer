import { contextBridge, ipcRenderer } from 'electron'
import type { ChunkFileEntry, ProjectTimeline, ProjectTree, Workspace } from '@shared/types'

const sddApi = {
  listWorkspaces: (): Promise<Workspace[]> => ipcRenderer.invoke('workspaces:list'),
  addWorkspace: (): Promise<Workspace | null> => ipcRenderer.invoke('workspaces:add'),
  removeWorkspace: (workspaceId: string): Promise<void> =>
    ipcRenderer.invoke('workspaces:remove', workspaceId),
  getTree: (workspaceId: string): Promise<ProjectTree | null> =>
    ipcRenderer.invoke('sdd:getTree', workspaceId),
  readFile: (path: string): Promise<string> => ipcRenderer.invoke('file:read', path),

  getTimeline: (workspaceId: string): Promise<ProjectTimeline> =>
    ipcRenderer.invoke('db:timeline', workspaceId),
  getChunkFiles: (
    workspaceId: string,
    changeId: string,
    chunkId: string
  ): Promise<ChunkFileEntry[]> =>
    ipcRenderer.invoke('db:chunkFiles', workspaceId, changeId, chunkId),

  copyText: (text: string): Promise<void> => ipcRenderer.invoke('clipboard:write', text),

  onDbUpdated: (callback: () => void): (() => void) => {
    const listener = (): void => callback()
    ipcRenderer.on('db:updated', listener)
    return () => ipcRenderer.removeListener('db:updated', listener)
  },

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
