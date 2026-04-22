import { useState, useRef, ButtonHTMLAttributes } from 'react'
import styles from './MechButton.module.css'

type LEDColor = 'green' | 'amber' | 'red' | 'off'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string
  led?: LEDColor
  size?: 'sm' | 'md' | 'lg'
  active?: boolean
}

export function MechButton({ label, led, size = 'md', active = false, children, className, ...rest }: Props) {
  const [pressed, setPressed] = useState(false)
  const pressedRef = useRef(false)

  function handlePointerDown() {
    pressedRef.current = true
    setPressed(true)
  }

  function handlePointerUp() {
    if (!pressedRef.current) return
    pressedRef.current = false
    setPressed(false)
  }

  return (
    <button
      className={`btn-mech ${styles.button} ${styles[size]} ${active ? styles.active : ''} ${className ?? ''}`}
      data-pressed={pressed}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      {...rest}
    >
      {led !== undefined && (
        <span
          className={`led ${styles.led}`}
          data-on={led === 'green' ? 'true' : undefined}
          data-warn={led === 'amber' ? 'true' : undefined}
          data-alert={led === 'red' ? 'true' : undefined}
        />
      )}
      {children ?? (label && (
        <span className={styles.label}>{label}</span>
      ))}
    </button>
  )
}
