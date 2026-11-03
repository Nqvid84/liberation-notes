import type { TextareaHTMLAttributes } from 'react'

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxLength: number
  value: string
}

export function TextArea({ maxLength, value, className = '', ...props }: TextAreaProps) {
  const remaining = maxLength - value.length

  return (
    <div className="relative">
      <textarea
        value={value}
        maxLength={maxLength}
        rows={5}
        className={`
          w-full rounded-2xl px-4 py-3
          bg-ui-input-surface border border-ui-surface-border
          font-ui text-base text-ui-text-primary
          placeholder:text-ui-text-ghost
          focus:outline-none focus:border-[rgba(155,170,215,0.6)] focus:bg-ui-input-focus
          resize-none transition-colors duration-150
          ${className}
        `}
        {...props}
      />
      <span className="absolute bottom-3 right-4 text-2xs text-ui-text-ghost pointer-events-none select-none">
        {remaining}
      </span>
    </div>
  )
}
