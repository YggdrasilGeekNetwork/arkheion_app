import { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
  fillHeight?: boolean
}

const Card = ({ children, className = '', fillHeight = false }: CardProps) => {
  return (
    <div
      className={`bg-card border border-stroke rounded-lg p-[0.75vh] lg:min-h-[6vh] ${className}`}
      style={fillHeight ? { height: '-webkit-fill-available' } : undefined}
    >
      {children}
    </div>
  )
}

export default Card