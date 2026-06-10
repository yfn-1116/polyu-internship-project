import type { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  highlight?: boolean
}

export default function GlassCard({ children, className = '', highlight = false }: GlassCardProps) {
  return (
    <div
      className={`glass-card ${highlight ? 'glass-card-highlight' : ''} p-4 ${className}`}
    >
      {children}
    </div>
  )
}
