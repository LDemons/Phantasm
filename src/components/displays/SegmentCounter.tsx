import styles from './SegmentCounter.module.css'

type Props = {
  seconds: number
  className?: string
}

function formatTime(secs: number): string {
  const s = Math.floor(secs)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  const mm = String(m % 60).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

export function SegmentCounter({ seconds, className }: Props) {
  return (
    <span className={`${styles.counter} ${className ?? ''}`}>
      {formatTime(seconds)}
    </span>
  )
}
