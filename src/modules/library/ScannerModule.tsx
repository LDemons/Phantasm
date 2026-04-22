import { useLibraryStore } from '../../store/library.store'
import styles from './ScannerModule.module.css'

type Props = {
  scanning: boolean
  hasTracks: boolean
  onScan: (path: string) => Promise<void>
}

export function ScannerModule({ scanning, hasTracks, onScan }: Props) {
  const scanProgress = useLibraryStore((s) => s.scanProgress)

  async function handleSelectFolder() {
    // Electron dialog would normally go through IPC
    // For now the user can drag and drop or we call a future dialog IPC
    const input = document.createElement('input')
    input.type = 'file'
    ;(input as HTMLInputElement & { webkitdirectory: boolean }).webkitdirectory = true
    input.onchange = async () => {
      if (!input.files || input.files.length === 0) return
      const path = (input.files[0] as File & { path: string }).path
      if (path) {
        const folderPath = path.substring(0, path.lastIndexOf('/') || path.lastIndexOf('\\') + 1)
        await onScan(folderPath)
      }
    }
    input.click()
  }

  const pct =
    scanProgress && scanProgress.total > 0
      ? Math.round((scanProgress.processed / scanProgress.total) * 100)
      : 0

  return (
    <div className={styles.container}>
      <div className={styles.terminal}>
        {!scanning ? (
          <>
            <div className={styles.headline}>
              <span className={styles.signal}>[NO MEDIA DETECTED]</span>
            </div>
            <div className={styles.sub}>INSERT SIGNAL SOURCE TO CONTINUE</div>
            <button className={styles.scanBtn} onClick={handleSelectFolder}>
              SCAN FOLDER
            </button>
            {hasTracks && (
              <span className={styles.hint}>
                — or library is loading, standby —
              </span>
            )}
          </>
        ) : (
          <>
            <div className={styles.headline}>
              <span className={styles.signal}>[SCANNING MEDIA...]</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${pct}%` }} />
            </div>
            <div className={styles.progressText}>
              {scanProgress ? (
                <>
                  {scanProgress.processed} / {scanProgress.total}
                  {' — '}
                  <span className={styles.currentFile}>
                    {scanProgress.current.split(/[/\\]/).pop() ?? ''}
                  </span>
                </>
              ) : (
                'INITIALIZING...'
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
