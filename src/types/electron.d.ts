import type { Track } from '../store/player.store'

type ScanProgress = {
  total: number
  processed: number
  current: string
}

type Album = {
  name: string
  artist: string
  year: number | null
  cover_path: string | null
  track_count: number
}

type Artist = {
  name: string
  track_count: number
}

declare global {
  interface Window {
    phantasm: {
      library: {
        scanFolder: (path: string) => Promise<{ added: number; updated: number; skipped: number }>
        getTracks: () => Promise<Track[]>
        getAlbums: () => Promise<Album[]>
        getArtists: () => Promise<Artist[]>
        onScanProgress: (cb: (p: ScanProgress) => void) => () => void
      }
      audio: {
        readFileAsBuffer: (path: string) => Promise<Buffer>
      }
      history: {
        recordPlay: (trackId: number) => Promise<void>
        getRecent: (limit?: number) => Promise<Track[]>
      }
      favorites: {
        toggle: (trackId: number) => Promise<boolean>
        getAll: () => Promise<Track[]>
      }
      window: {
        minimize: () => Promise<void>
        maximize: () => Promise<void>
        close: () => Promise<void>
      }
      onOAuthCallback: (cb: (url: string) => void) => () => void
    }
  }
}
