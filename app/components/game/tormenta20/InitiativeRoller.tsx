import { useState, useEffect } from 'react'
import { useDiceRoll } from '~/contexts/DiceRollContext'

type InitiativeRollerProps = {
  initiativeModifier: number
  currentRoll: number | null
  onStartTurn: () => void
  onRollInitiative: (result: number) => void
  isMyTurn: boolean
  inCombat?: boolean
  onToggleCombat: () => void
  initiativeRequested?: boolean
  initiativeRolledForDM?: boolean
  combatActiveDM?: boolean
  currentTurnName?: string | null
  dmRound?: number
  isMyTurnDM?: boolean
  onEndTurn?: () => void
}

export default function InitiativeRoller({
  initiativeModifier,
  currentRoll,
  onStartTurn,
  onRollInitiative,
  isMyTurn,
  inCombat = false,
  onToggleCombat,
  initiativeRequested = false,
  initiativeRolledForDM = false,
  combatActiveDM = false,
  currentTurnName = null,
  dmRound,
  isMyTurnDM = false,
  onEndTurn,
}: InitiativeRollerProps) {
  const { addRoll } = useDiceRoll()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [turnStarted, setTurnStarted] = useState(false)

  // Reset turnStarted whenever the turn changes
  useEffect(() => {
    setTurnStarted(false)
  }, [isMyTurnDM])

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

  // Can only roll if: not in DM combat, OR DM explicitly requested initiative
  const canRoll = !combatActiveDM || initiativeRequested

  return (
    <div className={`bg-card border rounded-lg p-4 mb-2 transition-colors ${
      initiativeRequested
        ? 'border-yellow-500/60 bg-yellow-500/5 animate-pulse'
        : combatActiveDM && isMyTurnDM
          ? 'border-green-500/60 bg-green-500/5'
          : 'border-stroke'
    }`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-muted">Iniciativa</span>
          {initiativeRequested && (
            <span className="text-[10px] font-semibold text-yellow-400 bg-yellow-500/20 px-1.5 py-0.5 rounded-full">
              Solicitada!
            </span>
          )}

          {currentRoll !== null && !isEditing && (
            <button
              type="button"
              onClick={canRoll ? handleStartEdit : undefined}
              className={`rounded px-3 py-1 text-base font-bold transition-colors ${
                canRoll
                  ? 'bg-accent text-card cursor-pointer hover:bg-accent-hover'
                  : 'bg-accent/60 text-card cursor-default'
              }`}
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

          {canRoll && (
            <button
              onClick={handleRollInitiative}
              className="px-3 py-2 bg-card-muted border border-stroke rounded text-sm font-semibold hover:border-accent transition-colors"
            >
              {currentRoll !== null ? 'Re-rolar' : 'Rolar'}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!combatActiveDM ? (
            // Local combat controls
            <>
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
                    className={`px-4 py-2 rounded font-semibold text-sm whitespace-nowrap transition-all ${
                      isMyTurn || currentRoll !== null
                        ? 'bg-accent text-card hover:bg-accent-hover'
                        : 'bg-card-muted text-muted border border-stroke cursor-not-allowed'
                    }`}
                  >
                    Iniciar Turno
                  </button>
                </>
              )}
            </>
          ) : (
            // DM-initiated combat controls
            <>
              <button
                onClick={() => { setTurnStarted(true); onStartTurn() }}
                disabled={!isMyTurnDM || turnStarted}
                className={`px-4 py-2 rounded font-semibold text-sm whitespace-nowrap transition-all ${
                  isMyTurnDM && !turnStarted
                    ? 'bg-green-600 text-white hover:bg-green-700 ring-2 ring-green-500/40 shadow-lg shadow-green-900/30'
                    : 'bg-card-muted text-muted border border-stroke cursor-not-allowed'
                }`}
              >
                {turnStarted ? 'Turno Iniciado' : 'Iniciar Turno'}
              </button>
              {isMyTurnDM && onEndTurn && (
                <button
                  onClick={onEndTurn}
                  className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors font-semibold text-sm whitespace-nowrap"
                >
                  Encerrar Turno
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* DM combat turn info */}
      {combatActiveDM && (
        <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-stroke">
          <div className="flex items-center gap-2">
            <span className="text-sm">⚔️</span>
            {isMyTurnDM ? (
              <span className="text-xs font-semibold text-green-400 flex items-center gap-1.5">
                É o seu turno!
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              </span>
            ) : (
              <span className="text-xs font-semibold text-fg">
                Turno de: {currentTurnName ?? '...'}
              </span>
            )}
          </div>
          {dmRound !== undefined && (
            <span className="text-[10px] text-muted bg-surface/50 px-1.5 py-0.5 rounded-full">
              Rodada {dmRound}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
