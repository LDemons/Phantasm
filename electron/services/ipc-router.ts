import { IpcMain, BrowserWindow } from 'electron'
import { LibraryAgent } from './library-agent'
import { SQLiteStore } from './sqlite-store'
import { readFile } from 'fs/promises'

const db = new SQLiteStore()
const library = new LibraryAgent(db)

export function setupIPCRouter(ipc: IpcMain) {
  // Library handlers
  ipc.handle('library:scan-folder', async (event, folderPath: string) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    return library.scan(folderPath, (progress) => {
      window?.webContents.send('library:scan-progress', progress)
    })
  })

  ipc.handle('library:get-tracks', () => db.getTracks())
  ipc.handle('library:get-albums', () => db.getAlbums())
  ipc.handle('library:get-artists', () => db.getArtists())

  // Audio
  ipc.handle('audio:read-file', async (_event, filePath: string) => {
    const buffer = await readFile(filePath)
    return buffer
  })

  // History
  ipc.handle('history:record-play', (_event, trackId: number) => {
    db.recordPlay(trackId)
  })
  ipc.handle('history:get-recent', (_event, limit = 50) => {
    return db.getRecentPlays(limit)
  })

  // Favorites
  ipc.handle('favorites:toggle', (_event, trackId: number) => {
    return db.toggleFavorite(trackId)
  })
  ipc.handle('favorites:get-all', () => db.getFavorites())

  // Window controls
  ipc.handle('window:minimize', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  })
  ipc.handle('window:maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.isMaximized() ? win.unmaximize() : win?.maximize()
  })
  ipc.handle('window:close', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close()
  })
}
