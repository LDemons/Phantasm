import { create } from 'zustand'

export type Track = {
  id: number
  path: string
  title: string
  artist: string
  album: string
  album_artist: string
  year: number | null
  genre: string
  duration: number
  bpm: number | null
  track_number: number | null
  disk_number: number | null
  cover_path: string | null
}

export type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'error'
export type RepeatMode = 'none' | 'track' | 'queue'
export type AudioSource = 'local' | 'spotify'

type PlayerState = {
  track: Track | null
  queue: Track[]
  queueIndex: number
  state: PlaybackState
  position: number
  volume: number
  muted: boolean
  repeat: RepeatMode
  shuffle: boolean
  source: AudioSource

  setTrack: (track: Track) => void
  setQueue: (queue: Track[], startIndex?: number) => void
  setState: (state: PlaybackState) => void
  setPosition: (seconds: number) => void
  setVolume: (v: number) => void
  toggleMute: () => void
  toggleRepeat: () => void
  toggleShuffle: () => void
  nextTrack: () => void
  prevTrack: () => void
  setSource: (s: AudioSource) => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  track: null,
  queue: [],
  queueIndex: 0,
  state: 'idle',
  position: 0,
  volume: 0.73,
  muted: false,
  repeat: 'none',
  shuffle: false,
  source: 'local',

  setTrack: (track) => set({ track, state: 'loading' }),

  setQueue: (queue, startIndex = 0) =>
    set({ queue, queueIndex: startIndex, track: queue[startIndex] ?? null }),

  setState: (state) => set({ state }),

  setPosition: (position) => set({ position }),

  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),

  toggleMute: () => set((s) => ({ muted: !s.muted })),

  toggleRepeat: () =>
    set((s) => ({
      repeat:
        s.repeat === 'none' ? 'track' : s.repeat === 'track' ? 'queue' : 'none',
    })),

  toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),

  nextTrack: () => {
    const { queue, queueIndex, repeat, shuffle } = get()
    if (queue.length === 0) return

    let next: number
    if (shuffle) {
      next = Math.floor(Math.random() * queue.length)
    } else if (queueIndex < queue.length - 1) {
      next = queueIndex + 1
    } else if (repeat === 'queue') {
      next = 0
    } else {
      set({ state: 'idle' })
      return
    }

    set({ queueIndex: next, track: queue[next], state: 'loading' })
  },

  prevTrack: () => {
    const { queue, queueIndex, position } = get()
    if (queue.length === 0) return

    if (position > 3) {
      set({ position: 0 })
      return
    }

    const prev = queueIndex > 0 ? queueIndex - 1 : 0
    set({ queueIndex: prev, track: queue[prev], state: 'loading' })
  },

  setSource: (source) => set({ source }),
}))
