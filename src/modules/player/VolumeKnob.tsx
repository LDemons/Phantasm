import { useRef, useCallback } from 'react'
import { usePlayerStore } from '../../store/player.store'
import { useAudioControls } from '../../hooks/useAudio'
import styles from './VolumeKnob.module.css'

const MIN_ANGLE = -135
const MAX_ANGLE = 135

export function VolumeKnob() {
  const volume = usePlayerStore((s) => s.volume)
  const muted = usePlayerStore((s) => s.muted)
  const { setVolume, toggleMute } = useAudioControls()
  const knobRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startY: number; startVol: number } | null>(null)

  const angle = MIN_ANGLE + volume * (MAX_ANGLE - MIN_ANGLE)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    dragRef.current = { startY: e.clientY, startVol: volume }
    ;(e.target as Element).setPointerCapture(e.pointerId)
  }, [volume])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return
    const delta = (dragRef.current.startY - e.clientY) / 120
    setVolume(dragRef.current.startVol + delta)
  }, [setVolume])

  const handlePointerUp = useCallback(() => {
    dragRef.current = null
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setVolume(volume - e.deltaY / 1200)
  }, [volume, setVolume])

  return (
    <div className={styles.container}>
      <div
        className={`${styles.knob} ${muted ? styles.muted : ''}`}
        ref={knobRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
        style={{ cursor: 'ns-resize' }}
        aria-label={`Volume ${Math.round(volume * 100)}%`}
        role="slider"
        aria-valuenow={Math.round(volume * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={styles.body}>
          <div
            className={styles.indicator}
            style={{ transform: `rotate(${angle}deg)` }}
          />
        </div>
      </div>
      <button
        className={styles.muteBtn}
        onClick={toggleMute}
        aria-label={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? 'MUTED' : `${Math.round(volume * 100)}`}
      </button>
    </div>
  )
}
