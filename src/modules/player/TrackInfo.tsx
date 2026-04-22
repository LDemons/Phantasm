import { PhosphorDisplay } from '../../components/displays/PhosphorDisplay'
import type { Track } from '../../store/player.store'
import styles from './TrackInfo.module.css'

type Props = {
  track: Track | null
  active: boolean
}

export function TrackInfo({ track, active }: Props) {
  if (!track) {
    return (
      <div className={styles.container}>
        <PhosphorDisplay
          value="NO MEDIA DETECTED"
          label="TITLE"
          dimmed
        />
        <PhosphorDisplay
          value="INSERT SIGNAL SOURCE"
          label="ARTIST"
          dimmed
          size="sm"
        />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.titleRow}>
        <span className={`${styles.title} ${active ? styles.titleActive : ''}`}>
          {track.title}
        </span>
      </div>
      <div className={styles.metaRow}>
        <span className={styles.artist}>{track.artist}</span>
        {track.album && (
          <>
            <span className={styles.sep}>/</span>
            <span className={styles.album}>{track.album}</span>
          </>
        )}
      </div>
      {track.bpm && (
        <div className={styles.bpmRow}>
          <span className={styles.bpmLabel}>BPM</span>
          <span className={styles.bpmValue}>{Math.round(track.bpm)}</span>
        </div>
      )}
    </div>
  )
}
