import { useEffect, useRef } from 'react'
import { useDiceRoll } from '~/contexts/DiceRollContext'

const DiceRollDisplay = () => {
  const { rolls, clearRolls } = useDiceRoll()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (rolls.length === 0) return

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        clearRolls()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [rolls.length, clearRolls])

  if (rolls.length === 0) return null

  return (
    <div ref={containerRef} className="fixed bottom-4 right-4 z-[100] space-y-2">
      {rolls.map((roll) => (
        <div
          key={roll.id}
          className="bg-card border-2 border-accent rounded-lg p-3 shadow-xl animate-slide-in min-w-[200px]"
        >
          <div className="text-xs font-semibold text-muted mb-1">{roll.label}</div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-accent font-bold text-lg">d{roll.diceSides}: {roll.roll}</span>
              {roll.modifier !== 0 && (
                <span className="text-muted">
                  {roll.modifier >= 0 ? '+' : ''}{roll.modifier}
                </span>
              )}
            </div>
            <div className="text-xl font-bold">{roll.total}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default DiceRollDisplay
