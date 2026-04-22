import { usePlayerStore } from '../store/player.store'
import styles from './OSDLayer.module.css'

export function OSDLayer() {
  const { state, source, track } = usePlayerStore((s) => ({
    state: s.state,
    source: s.source,
    track: s.track,
  }))

  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const srcLabel = source === 'local' ? 'CH:A' : 'CH:B'
  const sigLabel = state === 'playing' ? 'SIG:OK' : state === 'paused' ? 'SIG:HOLD' : 'SIG:IDLE'
  const bufLabel = state === 'loading' ? 'BUFF:...' : 'BUFF:100%'

  return (
    <div className={styles.layer} aria-hidden="true">
      <div className={styles.topLeft}>
        <span className={styles.indicator}>[{sigLabel}]</span>
        <span className={styles.indicator}>[{bufLabel}]</span>
      </div>

      <div className={styles.topRight}>
        <span className={styles.indicator}>[{srcLabel}]</span>
        {track && (
          <span className={styles.indicator} title={track.path}>
            [{track.artist.substring(0, 12).toUpperCase()}]
          </span>
        )}
      </div>

      <div className={styles.bottomLeft}>
        <span className={styles.indicator}>[PHNTM-2 REV.C]</span>
      </div>

      <div className={styles.bottomRight}>
        <span className={`${styles.indicator} ${styles.blink}`}>
          {timeStr}
        </span>
      </div>
    </div>
  )
}
