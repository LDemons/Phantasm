import { useEffect, useRef, useCallback } from 'react'
import { usePlayerStore } from '../store/player.store'

let audioContext: AudioContext | null = null
let audioElement: HTMLAudioElement | null = null
let sourceNode: MediaElementAudioSourceNode | null = null
let gainNode: GainNode | null = null

function getAudioContext() {
  if (!audioContext) {
    audioContext = new AudioContext()
    gainNode = audioContext.createGain()
    gainNode.connect(audioContext.destination)
  }
  return audioContext
}

function getOrCreateAudioElement() {
  if (!audioElement) {
    audioElement = new Audio()
    audioElement.crossOrigin = 'anonymous'
    audioElement.preload = 'auto'

    const ctx = getAudioContext()
    sourceNode = ctx.createMediaElementSource(audioElement)
    sourceNode.connect(gainNode!)
  }
  return audioElement
}

// Singleton hook — call once at the top of the tree
export function useAudio() {
  const { track, state, volume, muted, setState, setPosition, nextTrack } =
    usePlayerStore((s) => ({
      track: s.track,
      state: s.state,
      volume: s.volume,
      muted: s.muted,
      setState: s.setState,
      setPosition: s.setPosition,
      nextTrack: s.nextTrack,
    }))

  const trackPathRef = useRef<string | null>(null)
  const animFrameRef = useRef<number>(0)

  // Load and play track when it changes
  useEffect(() => {
    if (!track) return
    if (track.path === trackPathRef.current && state !== 'idle') return
    trackPathRef.current = track.path

    const el = getOrCreateAudioElement()

    async function load() {
      try {
        setState('loading')
        // Resume AudioContext (needed after user gesture)
        const ctx = getAudioContext()
        if (ctx.state === 'suspended') await ctx.resume()

        el!.src = `file://${track!.path.replace(/\\/g, '/')}`
        await el!.play()
        setState('playing')
      } catch {
        setState('error')
      }
    }

    load()
  }, [track, setState])

  // Sync play/pause state
  useEffect(() => {
    const el = getOrCreateAudioElement()
    if (state === 'playing' && el.paused) {
      el.play().catch(() => setState('error'))
    } else if (state === 'paused' && !el.paused) {
      el.pause()
    }
  }, [state, setState])

  // Volume / mute
  useEffect(() => {
    if (gainNode) {
      gainNode.gain.setTargetAtTime(muted ? 0 : volume, getAudioContext().currentTime, 0.02)
    }
  }, [volume, muted])

  // Position polling
  useEffect(() => {
    const el = getOrCreateAudioElement()

    function poll() {
      setPosition(el.currentTime)
      animFrameRef.current = requestAnimationFrame(poll)
    }

    if (state === 'playing') {
      animFrameRef.current = requestAnimationFrame(poll)
    } else {
      cancelAnimationFrame(animFrameRef.current)
    }

    return () => cancelAnimationFrame(animFrameRef.current)
  }, [state, setPosition])

  // Track end
  useEffect(() => {
    const el = getOrCreateAudioElement()
    el.addEventListener('ended', nextTrack)
    return () => el.removeEventListener('ended', nextTrack)
  }, [nextTrack])
}

// Controls — safe to call from any component
export function useAudioControls() {
  const { setState, setVolume, toggleMute, toggleRepeat, toggleShuffle, nextTrack, prevTrack } =
    usePlayerStore((s) => ({
      setState: s.setState,
      setVolume: s.setVolume,
      toggleMute: s.toggleMute,
      toggleRepeat: s.toggleRepeat,
      toggleShuffle: s.toggleShuffle,
      nextTrack: s.nextTrack,
      prevTrack: s.prevTrack,
    }))

  const play = useCallback(() => {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') ctx.resume()
    setState('playing')
  }, [setState])

  const pause = useCallback(() => setState('paused'), [setState])

  const seek = useCallback((seconds: number) => {
    const el = getOrCreateAudioElement()
    if (el) el.currentTime = seconds
  }, [])

  return { play, pause, seek, next: nextTrack, prev: prevTrack, setVolume, toggleMute, toggleRepeat, toggleShuffle }
}
