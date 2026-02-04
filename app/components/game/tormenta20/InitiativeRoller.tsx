import { useState } from 'react'
import { useDiceRoll } from '~/contexts/DiceRollContext'

type InitiativeRollerProps = {
  initiativeModifier: number
  currentRoll: number | null
  onStartTurn: () => void
  onRollInitiative: (result: number) => void
  isMyTurn: boolean
  inCombat?: boolean
  onToggleCombat: () => void
}

export default function InitiativeRoller({
  initiativeModifier,
  currentRoll,
  onStartTurn,
  onRollInitiative,
  isMyTurn,
  inCombat = false,
  onToggleCombat
}: InitiativeRollerProps) {
  const { addRoll } = useDiceRoll()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')

  const handleRollInitiative = () => {
    const { total } = addRoll('Iniciativa (d20)', initiativeModifier, 20)
    onRollInitiative(total)
  }

  const handleStartEdit = () => {
    setEditValue(currentRoll?.toString() || '')
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    const value = parseInt(editValue)
    if (!isNaN(value)) {
      onRollInitiative(value)
    }
    setIsEditing(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
    }
  }

  return (
    <div className="bg-card border border-stroke rounded-lg p-4 mb-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-muted">Iniciativa</span>

          {currentRoll !== null && !isEditing && (
            <button
              type="button"
              onClick={handleStartEdit}
              className="bg-accent text-card rounded px-3 py-1 text-base font-bold cursor-pointer hover:bg-accent-hover transition-colors"
            >
              {currentRoll}
            </button>
          )}

          {isEditing && (
            <input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={handleSaveEdit}
              className="w-16 px-3 py-1 bg-accent text-card rounded text-base font-bold text-center"
            />
          )}

          <button
            onClick={handleRollInitiative}
            className="px-3 py-2 bg-card-muted border border-stroke rounded text-sm font-semibold hover:border-accent transition-colors"
          >
            {currentRoll !== null ? 'Re-rolar' : 'Rolar'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {!inCombat ? (
            <button
              onClick={onToggleCombat}
              disabled={currentRoll === null}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
            >
              Iniciar Combate
            </button>
          ) : (
            <>
              <button
                onClick={onToggleCombat}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-semibold text-sm whitespace-nowrap"
              >
                Encerrar Combate
              </button>
              <button
                onClick={onStartTurn}
                disabled={!isMyTurn && currentRoll === null}
                className="px-4 py-2 bg-accent text-card rounded hover:bg-accent-hover transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
              >
                Iniciar Turno
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
