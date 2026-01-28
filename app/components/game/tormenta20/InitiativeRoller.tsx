import { useDiceRoll } from '~/contexts/DiceRollContext'

type InitiativeRollerProps = {
  initiativeModifier: number
  currentRoll: number | null
  onStartTurn: () => void
  onRollInitiative: (result: number) => void
  isMyTurn: boolean
}

export default function InitiativeRoller({
  initiativeModifier,
  currentRoll,
  onStartTurn,
  onRollInitiative,
  isMyTurn
}: InitiativeRollerProps) {
  const { addRoll } = useDiceRoll()

  const handleRollInitiative = () => {
    const { total } = addRoll('Iniciativa (d20)', initiativeModifier, 20)
    onRollInitiative(total)
  }

  return (
    <div className="bg-card border border-stroke rounded-lg p-4 mb-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-muted">Iniciativa</span>
          {currentRoll !== null && (
            <div className="bg-accent text-card rounded px-3 py-1 text-base font-bold">
              {currentRoll}
            </div>
          )}
          <button
            onClick={handleRollInitiative}
            className="px-3 py-2 bg-card-muted border border-stroke rounded text-sm font-semibold hover:border-accent transition-colors"
          >
            {currentRoll !== null ? 'Re-rolar' : 'Rolar'}
          </button>
        </div>

        <button
          onClick={onStartTurn}
          disabled={!isMyTurn && currentRoll === null}
          className="px-4 py-2 bg-accent text-card rounded hover:bg-accent-hover transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
        >
          Iniciar Turno
        </button>
      </div>
    </div>
  )
}
