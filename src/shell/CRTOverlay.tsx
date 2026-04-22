import { useEffect, useRef } from 'react'
import styles from './CRTOverlay.module.css'

export function CRTOverlay() {
  const flickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>

    function scheduleFlicker() {
      const delay = 45_000 + Math.random() * 45_000
      timeout = setTimeout(() => {
        const el = flickerRef.current
        if (!el) return

        el.style.opacity = '0.88'
        setTimeout(() => {
          el.style.opacity = '1'
          setTimeout(() => {
            el.style.opacity = '0.90'
            setTimeout(() => {
              el.style.opacity = '1'
              scheduleFlicker()
            }, 33)
          }, 50)
        }, 33)
      }, delay)
    }

    scheduleFlicker()
    return () => clearTimeout(timeout)
  }, [])

  return (
    <div
      className={styles.overlay}
      ref={flickerRef}
      aria-hidden="true"
    >
      <div className={styles.scanlines} />
      <div className={styles.vignette} />
    </div>
  )
}
