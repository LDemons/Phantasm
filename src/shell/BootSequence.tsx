import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import styles from './BootSequence.module.css'

const BOOT_LINES = [
  'PHANTASM SYSTEM v2.1.4 — REV.C',
  'COPYRIGHT (C) 1998 KUROSAWA ELECTRONICS CO.',
  '─────────────────────────────────────────────',
  'POST DIAGNOSTICS...',
  '  [OK] CPU: CORE0 CORE1 CORE2 CORE3',
  '  [OK] MEMORY: 16384MB — NO ERRORS',
  '  [OK] AUDIO SUBSYSTEM: INITIALIZED',
  '  [OK] VIDEO BUFFER: ALLOCATED',
  '  [OK] PHOSPHOR DISPLAY: CALIBRATED',
  '─────────────────────────────────────────────',
  'LOADING SIGNAL PROCESSOR...',
  'LOADING MEDIA ENGINE...',
  'LOADING LIBRARY INDEX...',
  '─────────────────────────────────────────────',
  'ALL SYSTEMS NOMINAL',
  'SIGNAL FOUND.',
  '',
  'PHANTASM READY.',
]

type Props = {
  onComplete: () => void
}

export function BootSequence({ onComplete }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const linesRef = useRef<(HTMLElement | null)[]>([])
  const scanRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.4,
          delay: 0.3,
          onComplete,
        })
      },
    })

    // Stagger each line appearing
    linesRef.current.forEach((el, i) => {
      if (!el) return
      const baseDelay = 0.05 + i * 0.09 + (Math.random() * 0.04 - 0.02)
      tl.fromTo(
        el,
        { opacity: 0, x: -6 },
        { opacity: 1, x: 0, duration: 0.12, ease: 'power1.out' },
        baseDelay
      )
    })

    // Screen scan effect at the end
    tl.fromTo(
      scanRef.current,
      { scaleY: 0, opacity: 0.8 },
      { scaleY: 1, opacity: 0, duration: 0.5, ease: 'power2.inOut' },
      '-=0.2'
    )

    return () => {
      tl.kill()
    }
  }, [onComplete])

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.terminal}>
        {BOOT_LINES.map((line, i) => (
          <span
            key={i}
            ref={(el) => { linesRef.current[i] = el }}
            className={`${styles.line} ${line === '' ? styles.spacer : ''} ${
              line.includes('OK') ? styles.ok : ''
            } ${line.includes('READY') || line.includes('SIGNAL FOUND') ? styles.hero : ''}`}
          >
            {line}
            {i === BOOT_LINES.length - 1 && (
              <span className={styles.cursor}>_</span>
            )}
          </span>
        ))}
      </div>
      <div className={styles.scanLine} ref={scanRef} />
    </div>
  )
}
