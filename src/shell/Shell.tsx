import { useEffect } from 'react'
import { BootSequence } from './BootSequence'
import { CRTOverlay } from './CRTOverlay'
import { OSDLayer } from './OSDLayer'
import { PlayerDeck } from '../modules/player/PlayerDeck'
import { LibraryBay } from '../modules/library/LibraryBay'
import { useUIStore } from '../store/ui.store'
import { useLibraryStore } from '../store/library.store'
import styles from './Shell.module.css'

export function Shell() {
  const bootComplete = useUIStore((s) => s.bootComplete)
  const setBootComplete = useUIStore((s) => s.setBootComplete)
  const loadLibrary = useLibraryStore((s) => s.loadLibrary)

  useEffect(() => {
    if (bootComplete) {
      loadLibrary()
    }
  }, [bootComplete, loadLibrary])

  return (
    <div className={styles.shell}>
      <CRTOverlay />
      <OSDLayer />

      {!bootComplete && (
        <BootSequence onComplete={() => setBootComplete(true)} />
      )}

      {bootComplete && (
        <div className={styles.content}>
          <div className={styles.titleBar}>
            <span className={styles.titleLabel}>PHNTM-2 REV.C</span>
            <div className={styles.windowControls}>
              <button
                className={styles.winBtn}
                onClick={() => window.phantasm.window.minimize()}
                aria-label="Minimize"
              />
              <button
                className={styles.winBtn}
                onClick={() => window.phantasm.window.maximize()}
                aria-label="Maximize"
              />
              <button
                className={`${styles.winBtn} ${styles.winBtnClose}`}
                onClick={() => window.phantasm.window.close()}
                aria-label="Close"
              />
            </div>
          </div>

          <div className={styles.mainArea}>
            <LibraryBay />
          </div>

          <div className={styles.playerArea}>
            <PlayerDeck />
          </div>
        </div>
      )}
    </div>
  )
}
