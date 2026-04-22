import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('phantasm', {
  // Library
  library: {
    scanFolder: (folderPath: string) =>
      ipcRenderer.invoke('library:scan-folder', folderPath),
    getTracks: () => ipcRenderer.invoke('library:get-tracks'),
    getAlbums: () => ipcRenderer.invoke('library:get-albums'),
    getArtists: () => ipcRenderer.invoke('library:get-artists'),
    onScanProgress: (cb: (progress: ScanProgress) => void) => {
      ipcRenderer.on('library:scan-progress', (_e, p) => cb(p))
      return () => ipcRenderer.removeAllListeners('library:scan-progress')
    },
  },

  // Audio
  audio: {
    readFileAsBuffer: (filePath: string) =>
      ipcRenderer.invoke('audio:read-file', filePath),
  },

  // Playback history
  history: {
    recordPlay: (trackId: number) =>
      ipcRenderer.invoke('history:record-play', trackId),
    getRecent: (limit?: number) =>
      ipcRenderer.invoke('history:get-recent', limit),
  },

  // Favorites
  favorites: {
    toggle: (trackId: number) =>
      ipcRenderer.invoke('favorites:toggle', trackId),
    getAll: () => ipcRenderer.invoke('favorites:get-all'),
  },

  // Window controls
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
  },

  // OAuth callbacks
  onOAuthCallback: (cb: (url: string) => void) => {
    ipcRenderer.on('phantasm:oauth-callback', (_e, url) => cb(url))
    return () => ipcRenderer.removeAllListeners('phantasm:oauth-callback')
  },
})

type ScanProgress = {
  total: number
  processed: number
  current: string
}
