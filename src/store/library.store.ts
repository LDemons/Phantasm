import { create } from 'zustand'
import type { Track } from './player.store'

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

type ScanProgress = {
  total: number
  processed: number
  current: string
}

type LibraryView = 'list' | 'capsule' | 'rack'

type LibraryState = {
  tracks: Track[]
  albums: Album[]
  artists: Artist[]
  loaded: boolean
  scanning: boolean
  scanProgress: ScanProgress | null
  searchQuery: string
  view: LibraryView

  loadLibrary: () => Promise<void>
  scanFolder: (path: string) => Promise<void>
  setSearchQuery: (q: string) => void
  setView: (v: LibraryView) => void
  filteredTracks: () => Track[]
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  tracks: [],
  albums: [],
  artists: [],
  loaded: false,
  scanning: false,
  scanProgress: null,
  searchQuery: '',
  view: 'list',

  loadLibrary: async () => {
    const [tracks, albums, artists] = await Promise.all([
      window.phantasm.library.getTracks(),
      window.phantasm.library.getAlbums(),
      window.phantasm.library.getArtists(),
    ])
    set({ tracks, albums, artists, loaded: true })
  },

  scanFolder: async (folderPath) => {
    set({ scanning: true, scanProgress: { total: 0, processed: 0, current: '' } })

    const unsub = window.phantasm.library.onScanProgress((progress) => {
      set({ scanProgress: progress })
    })

    try {
      await window.phantasm.library.scanFolder(folderPath)
      await get().loadLibrary()
    } finally {
      unsub()
      set({ scanning: false, scanProgress: null })
    }
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setView: (view) => set({ view }),

  filteredTracks: () => {
    const { tracks, searchQuery } = get()
    if (!searchQuery.trim()) return tracks
    const q = searchQuery.toLowerCase()
    return tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q)
    )
  },
}))
