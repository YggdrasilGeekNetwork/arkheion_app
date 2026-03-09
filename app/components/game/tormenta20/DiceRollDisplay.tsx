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
      {rolls.map((roll) => {
        const isD20 = roll.diceSides === 20
        const isCrit = isD20 && roll.roll === 20
        const isFumble = isD20 && roll.roll === 1

        return (
          <div
            key={roll.id}
            className={`border-2 rounded-lg p-3 shadow-xl animate-slide-in min-w-[200px] bg-card ${
              isCrit ? 'border-yellow-400' : isFumble ? 'border-red-500' : 'border-accent'
            }`}
          >
            <div className="text-xs font-semibold text-muted mb-1">{roll.label}</div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className={`font-bold text-lg ${isCrit ? 'text-yellow-400' : isFumble ? 'text-red-500' : 'text-accent'}`}>
                  d{roll.diceSides}: {roll.roll}
                </span>
                {roll.modifier !== 0 && (
                  <span className="text-muted">
                    {roll.modifier >= 0 ? '+' : ''}{roll.modifier}
                  </span>
                )}
              </div>
              <div className="text-xl font-bold">{roll.total}</div>
            </div>
            {isCrit && (
              <div className="mt-1 text-xs font-bold text-yellow-400 text-center tracking-wide">
                20 Natural — Acerto Crítico!
              </div>
            )}
            {isFumble && (
              <div className="mt-1 text-xs font-bold text-red-500 text-center tracking-wide">
                1 Natural — Falha Crítica!
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default DiceRollDisplay
