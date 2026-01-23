import { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'roll'
}

const Button = ({ variant = 'default', className = '', ...props }: ButtonProps) => {
  const baseClasses = 'text-center px-3 py-2 text-sm border border-stroke rounded-lg user-select-none transition-colors'
  const variantClasses = {
    default: 'bg-btn-bg hover:bg-card',
    roll: 'bg-btn-bg hover:bg-card px-3 py-1.5'
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
}

export default Button