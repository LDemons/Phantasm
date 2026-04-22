import styles from './PlayerDeck.module.css'
import { TransportBar } from './TransportBar'
import { SeekTimeline } from './SeekTimeline'
import { TrackInfo } from './TrackInfo'
import { VolumeKnob } from './VolumeKnob'
import { usePlayerStore } from '../../store/player.store'
import { useAudio } from '../../hooks/useAudio'

export function PlayerDeck() {
  useAudio()

  const { track, state } = usePlayerStore((s) => ({
    track: s.track,
    state: s.state,
  }))

  const isActive = state === 'playing' || state === 'paused'

  return (
    <div className={`mat-plastic ${styles.deck}`}>
      <div className={styles.insetRail}>
        <div className={styles.insetLeft}>
          <TrackInfo track={track} active={isActive} />
        </div>

        <div className={styles.insetCenter}>
          <SeekTimeline />
          <TransportBar />
        </div>

        <div className={styles.insetRight}>
          <VolumeKnob />
        </div>
      </div>

      <div className={styles.sourceIndicator}>
        <span className={styles.sourceTag}>
          {usePlayerStore.getState().source === 'local' ? '[SRC:LOCAL]' : '[SRC:SPOTIFY]'}
        </span>
      </div>
    </div>
  )
}
