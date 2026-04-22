import { useRef, useCallback } from 'react'
import { usePlayerStore } from '../../store/player.store'
import { useAudioControls } from '../../hooks/useAudio'
import { SegmentCounter } from '../../components/displays/SegmentCounter'
import styles from './SeekTimeline.module.css'

export function SeekTimeline() {
  const { position, track } = usePlayerStore((s) => ({
    position: s.position,
    track: s.track,
  }))
  const { seek } = useAudioControls()
  const railRef = useRef<HTMLDivElement>(null)

  const duration = track?.duration ?? 0
  const progress = duration > 0 ? position / duration : 0
  const remaining = duration - position

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!railRef.current || duration === 0) return
      const rect = railRef.current.getBoundingClientRect()
      const ratio = (e.clientX - rect.left) / rect.width
      seek(Math.max(0, Math.min(1, ratio)) * duration)
    },
    [duration, seek]
  )

  return (
    <div className={styles.container}>
      <SegmentCounter seconds={position} className={styles.time} />

      <div
        className={styles.rail}
        ref={railRef}
        onClick={handleClick}
        role="slider"
        aria-label="Seek"
        aria-valuenow={position}
        aria-valuemin={0}
        aria-valuemax={duration}
      >
        <div className={styles.track}>
          <div
            className={styles.fill}
            style={{ width: `${progress * 100}%` }}
          />
          <div
            className={styles.puck}
            style={{ left: `${progress * 100}%` }}
          />
        </div>
      </div>

      <SegmentCounter seconds={remaining} className={`${styles.time} ${styles.timeRemaining}`} />
    </div>
  )
}
