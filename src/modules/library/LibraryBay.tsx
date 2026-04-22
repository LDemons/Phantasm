import { useLibraryStore } from '../../store/library.store'
import { usePlayerStore } from '../../store/player.store'
import { ScannerModule } from './ScannerModule'
import styles from './LibraryBay.module.css'
import type { Track } from '../../store/player.store'

export function LibraryBay() {
  const { tracks, loaded, scanning, scanFolder, filteredTracks, searchQuery, setSearchQuery } =
    useLibraryStore((s) => ({
      tracks: s.tracks,
      loaded: s.loaded,
      scanning: s.scanning,
      scanFolder: s.scanFolder,
      filteredTracks: s.filteredTracks,
      searchQuery: s.searchQuery,
      setSearchQuery: s.setSearchQuery,
    }))

  const setQueue = usePlayerStore((s) => s.setQueue)

  function playTrack(track: Track, allTracks: Track[]) {
    const idx = allTracks.indexOf(track)
    setQueue(allTracks, idx >= 0 ? idx : 0)
  }

  if (!loaded || scanning) {
    return (
      <ScannerModule
        scanning={scanning}
        onScan={scanFolder}
        hasTracks={tracks.length > 0}
      />
    )
  }

  const displayed = filteredTracks()

  return (
    <div className={styles.bay}>
      <div className={styles.header}>
        <span className={styles.label}>MEDIA LIBRARY</span>
        <span className={styles.count}>[{displayed.length} TRACKS]</span>
        <div className={styles.searchWrap}>
          <span className={styles.searchPrefix}>/</span>
          <input
            className={styles.search}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH SIGNAL..."
            spellCheck={false}
          />
        </div>
        <button
          className={styles.addBtn}
          onClick={async () => {
            // In a real Electron app this would open a folder picker
            // For now, a placeholder IPC call
          }}
        >
          + ADD FOLDER
        </button>
      </div>

      <div className={styles.listHeader}>
        <span className={styles.colNum}>#</span>
        <span className={styles.colTitle}>TITLE</span>
        <span className={styles.colArtist}>ARTIST</span>
        <span className={styles.colAlbum}>ALBUM</span>
        <span className={styles.colDur}>DURATION</span>
      </div>

      <div className={styles.list}>
        {displayed.length === 0 ? (
          <div className={styles.empty}>
            <span>[NO SIGNAL MATCH — REFINE QUERY]</span>
          </div>
        ) : (
          displayed.map((track, i) => (
            <TrackRow
              key={track.id}
              track={track}
              index={i + 1}
              onPlay={() => playTrack(track, displayed)}
            />
          ))
        )}
      </div>
    </div>
  )
}

type RowProps = {
  track: Track
  index: number
  onPlay: () => void
}

function TrackRow({ track, index, onPlay }: RowProps) {
  const currentTrack = usePlayerStore((s) => s.track)
  const isActive = currentTrack?.id === track.id

  function formatDur(secs: number) {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${String(s).padStart(2, '0')}`
  }

  return (
    <div
      className={`${styles.row} ${isActive ? styles.rowActive : ''}`}
      onDoubleClick={onPlay}
      role="row"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onPlay()}
    >
      <span className={styles.colNum}>
        {isActive ? (
          <span className={styles.playingDot} />
        ) : (
          <span className={styles.indexNum}>{index}</span>
        )}
      </span>
      <span className={`${styles.colTitle} ${styles.rowText}`}>{track.title}</span>
      <span className={`${styles.colArtist} ${styles.rowText} ${styles.dimmed}`}>{track.artist}</span>
      <span className={`${styles.colAlbum} ${styles.rowText} ${styles.dimmed}`}>{track.album}</span>
      <span className={`${styles.colDur} ${styles.dimmed}`}>{formatDur(track.duration)}</span>
    </div>
  )
}
