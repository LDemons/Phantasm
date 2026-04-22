import { app, BrowserWindow, protocol, ipcMain } from 'electron'
import { join } from 'path'
import { setupIPCRouter } from './services/ipc-router'

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    frame: false,
    backgroundColor: '#0A0C0F',
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'phantasm',
    privileges: { secure: true, standard: true, supportFetchAPI: true },
  },
])

app.whenReady().then(() => {
  setupIPCRouter(ipcMain)
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('open-url', (_event, url) => {
  mainWindow?.webContents.send('phantasm:oauth-callback', url)
})

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('phantasm', process.execPath, [
      process.argv[1],
    ])
  }
} else {
  app.setAsDefaultProtocolClient('phantasm')
}
