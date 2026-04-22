import { create } from 'zustand'

type ActiveModule = 'library' | 'spotify' | 'visualizer'
type NightModeState = 'auto' | 'on' | 'off'

type UIState = {
  bootComplete: boolean
  activeModule: ActiveModule
  nightMode: NightModeState
  showQueue: boolean
  showVisualizer: boolean

  setBootComplete: (v: boolean) => void
  setActiveModule: (m: ActiveModule) => void
  setNightMode: (m: NightModeState) => void
  toggleQueue: () => void
  toggleVisualizer: () => void
}

export const useUIStore = create<UIState>((set) => ({
  bootComplete: false,
  activeModule: 'library',
  nightMode: 'auto',
  showQueue: false,
  showVisualizer: true,

  setBootComplete: (v) => set({ bootComplete: v }),
  setActiveModule: (m) => set({ activeModule: m }),
  setNightMode: (m) => set({ nightMode: m }),
  toggleQueue: () => set((s) => ({ showQueue: !s.showQueue })),
  toggleVisualizer: () => set((s) => ({ showVisualizer: !s.showVisualizer })),
}))
