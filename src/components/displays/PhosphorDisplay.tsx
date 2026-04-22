import styles from './PhosphorDisplay.module.css'

type Props = {
  value: string
  label?: string
  size?: 'sm' | 'md' | 'lg'
  dimmed?: boolean
  className?: string
}

export function PhosphorDisplay({ value, label, size = 'md', dimmed = false, className }: Props) {
  return (
    <div className={`display-phosphor ${styles.display} ${styles[size]} ${dimmed ? styles.dimmed : ''} ${className ?? ''}`}>
      {label && <span className={styles.label}>{label}</span>}
      <span className={styles.value}>{value}</span>
    </div>
  )
}
