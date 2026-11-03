import type { ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'primary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const BASE =
  'rounded-full px-5 py-2.5 text-sm font-ui font-medium border cursor-pointer transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed'

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-ui-button-surface border-ui-surface-border text-ui-text-primary hover:bg-ui-button-hover',
  ghost:
    'bg-transparent border-white/30 text-ui-text-secondary hover:bg-white/20',
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${BASE} ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
