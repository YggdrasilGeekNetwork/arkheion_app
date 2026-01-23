import { ReactNode } from 'react'
import { useDiceRoll } from '~/contexts/DiceRollContext'

type RollableProps = {
  label: string
  modifier: number
  children: ReactNode
  className?: string
}

const Rollable = ({ label, modifier, children, className = '' }: RollableProps) => {
  const { addRoll } = useDiceRoll()

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    addRoll(label, modifier)
  }

  return (
    <span
      onClick={handleClick}
      className={`cursor-pointer hover:text-accent transition-colors border-b border-dotted border-current ${className}`}
      title={`Clique para rolar d20${modifier >= 0 ? '+' : ''}${modifier}`}
    >
      {children}
    </span>
  )
}

export default Rollable
