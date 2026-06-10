import type { ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'record'
type ButtonSize = 'sm' | 'md' | 'lg'

interface IconButtonProps {
  icon: ReactNode
  label?: string
  variant?: ButtonVariant
  size?: ButtonSize
  active?: boolean
  onClick?: () => void
  disabled?: boolean
  className?: string
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[#1E88E5] text-white hover:bg-[#1976D2] shadow-md shadow-[#1E88E5]/20',
  secondary: 'bg-white text-[#627D98] hover:bg-[#F0F7FF] border border-[#E0ECF8]',
  danger: 'bg-[#EF4444] text-white hover:bg-[#DC2626]',
  record: 'bg-[#EF4444] text-white hover:bg-[#DC2626] shadow-lg',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-xl',
}

export default function IconButton({
  icon, label, variant = 'primary', size = 'md', active = false, onClick, disabled = false, className = '',
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-1.5 rounded-full
        transition-all duration-300 cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variantClasses[variant]} ${sizeClasses[size]}
        ${variant === 'record' && active ? 'record-btn-active' : ''}
        ${className}
      `}
      title={label}
    >
      {icon}
      {label && size === 'lg' && <span className="text-xs font-medium">{label}</span>}
    </button>
  )
}
