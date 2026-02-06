import { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
}

const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`bg-card border border-stroke rounded-lg p-[0.75vh] lg:min-h-[6vh] ${className}`} style={{ height: '-webkit-fill-available'}}>
      {children}
    </div>
  )
}

export default Card