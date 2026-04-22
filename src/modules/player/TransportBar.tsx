import { MechButton } from '../../components/buttons/MechButton'
import { usePlayerStore } from '../../store/player.store'
import { useAudioControls } from '../../hooks/useAudio'
import styles from './TransportBar.module.css'

export function TransportBar() {
  const { state, repeat, shuffle } = usePlayerStore((s) => ({
    state: s.state,
    repeat: s.repeat,
    shuffle: s.shuffle,
  }))
  const { play, pause, next, prev, toggleRepeat, toggleShuffle } = useAudioControls()

  const isPlaying = state === 'playing'

  return (
    <div className={styles.bar}>
      <MechButton
        size="sm"
        onClick={toggleShuffle}
        active={shuffle}
        aria-label="Shuffle"
        title="SHUFFLE"
      >
        <span className={styles.icon}>SHF</span>
      </MechButton>

      <MechButton
        size="md"
        onClick={prev}
        aria-label="Previous"
        title="PREV"
      >
        <span className={styles.icon}>|&#9664;</span>
      </MechButton>

      <MechButton
        size="lg"
        onClick={isPlaying ? pause : play}
        active={isPlaying}
        led={isPlaying ? 'green' : 'off'}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        title={isPlaying ? 'PAUSE' : 'PLAY'}
      >
        <span className={styles.playIcon}>
          {isPlaying ? '&#9646;&#9646;' : '&#9654;'}
        </span>
      </MechButton>

      <MechButton
        size="md"
        onClick={next}
        aria-label="Next"
        title="NEXT"
      >
        <span className={styles.icon}>&#9654;|</span>
      </MechButton>

      <MechButton
        size="sm"
        onClick={toggleRepeat}
        active={repeat !== 'none'}
        aria-label="Repeat"
        title={`REPEAT: ${repeat.toUpperCase()}`}
      >
        <span className={styles.icon}>
          {repeat === 'track' ? 'R1' : 'RPT'}
        </span>
      </MechButton>
    </div>
  )
}
