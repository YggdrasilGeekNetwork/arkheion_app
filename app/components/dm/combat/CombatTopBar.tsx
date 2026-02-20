import { useMesa } from '~/contexts/MesaContext'
import { getActiveEncounter } from '~/reducers/mesaReducer'

type CombatTopBarProps = {
  mesaName: string
  onEndCombat: () => void
  onShowDashboard?: () => void
}

export default function CombatTopBar({ mesaName, onEndCombat, onShowDashboard }: CombatTopBarProps) {
  const { state } = useMesa()
  const { combatState } = state
  const encounter = getActiveEncounter(state)

  const currentEntry = combatState?.initiativeOrder[combatState.currentTurnIndex]
  const isRolling = combatState?.status === 'rolling_initiative'

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-red-950/40 border-b border-red-500/30 flex-shrink-0">
      <span className="text-red-400 text-lg">⚔️</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-red-300">
            {encounter?.name || 'Combate'}
          </span>
          <span className="text-xs text-muted">
            {mesaName}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          {isRolling ? (
            <span className="text-yellow-400 animate-pulse">Aguardando iniciativas...</span>
          ) : (
            <>
              <span>Rodada {combatState?.round}</span>
              {currentEntry && (
                <>
                  <span className="text-stroke">·</span>
                  <span className="text-accent">
                    Turno: {currentEntry.name}
                  </span>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {onShowDashboard && (
        <button
          onClick={onShowDashboard}
          className="px-3 py-1.5 text-xs font-medium text-muted border border-stroke
            rounded hover:text-fg hover:border-accent/30 transition-colors"
        >
          Ver Dashboard
        </button>
      )}

      <button
        onClick={onEndCombat}
        className="px-3 py-1.5 text-xs font-medium text-red-400 border border-red-500/40
          rounded hover:bg-red-500/15 transition-colors"
      >
        Encerrar Combate
      </button>
    </div>
  )
}
