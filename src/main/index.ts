import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { is } from './isDev'
import { WorkspaceStore } from './workspaceStore'
import { FileWatcherService } from './fileWatcher'
import { registerIpcHandlers } from './ipcHandlers'
import { registerLocalFileProtocolHandler, registerPrivilegedScheme } from './localFileProtocol'

registerPrivilegedScheme() // precisa rodar antes de app.whenReady()

function createWindow(store: WorkspaceStore): BrowserWindow {
  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  window.on('ready-to-show', () => window.show())

  window.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  const watcher = new FileWatcherService(window.webContents)
  registerIpcHandlers(window, store, watcher)
  for (const workspace of store.list()) watcher.watch(workspace)

  window.on('closed', () => watcher.unwatchAll())

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    window.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    window.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return window
}

app.whenReady().then(() => {
  registerLocalFileProtocolHandler()

  const store = new WorkspaceStore(app.getPath('userData'))
  createWindow(store)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(store)
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
