'use client'
import { useEffect, useState, useRef } from 'react'

interface CounterProps {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}

export function AnimatedCounter({ 
  value, 
  prefix = '', 
  suffix = '', 
  duration = 1500,
  className = ''
}: CounterProps) {
  const [display, setDisplay] = useState(0)
  const previousValue = useRef(0)
  const startTime = useRef<number | null>(null)
  const rafId = useRef<number | null>(null)

  useEffect(() => {
    const start = previousValue.current
    const end = value
    const change = end - start

    if (change === 0) return

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp
      const progress = Math.min((timestamp - startTime.current) / duration, 1)
      
      // Easing function (easeOutExpo)
      const eased = change === 0 ? 0 : 1 - Math.pow(2, -10 * progress)
      
      const current = start + change * eased
      setDisplay(current)

      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate)
      } else {
        previousValue.current = end
        startTime.current = null
      }
    }

    rafId.current = requestAnimationFrame(animate)

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [value, duration])

  const formatted = display.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}{formatted}{suffix}
    </span>
  )
}
