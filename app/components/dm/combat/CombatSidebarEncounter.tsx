import { useState } from 'react'
import { useMesa } from '~/contexts/MesaContext'
import { getActiveEncounter } from '~/reducers/mesaReducer'

export default function CombatSidebarEncounter() {
  const { state, dispatch } = useMesa()
  const encounter = getActiveEncounter(state)
  const [expanded, setExpanded] = useState(true)

  if (!encounter) return null

  function handleDamage(enemyId: string, currentPv: number, amount: number) {
    const newPv = Math.max(0, currentPv - amount)
    dispatch({
      type: 'UPDATE_ENEMY_IN_ENCOUNTER',
      payload: { enemyId, updates: { currentPv: newPv } },
    })
    // Also update combat state if active
    if (state.combatState) {
      const entry = state.combatState.initiativeOrder.find(
        e => e.type === 'enemy' && e.sourceId === enemyId
      )
      if (entry) {
        dispatch({
          type: 'UPDATE_COMBAT_ENTRY',
          payload: {
            entryId: entry.id,
            updates: { currentPv: newPv, isDefeated: newPv <= 0 },
          },
        })
      }
    }
  }

  function handleHeal(enemyId: string, currentPv: number, maxPv: number, amount: number) {
    const newPv = Math.min(maxPv, currentPv + amount)
    dispatch({
      type: 'UPDATE_ENEMY_IN_ENCOUNTER',
      payload: { enemyId, updates: { currentPv: newPv } },
    })
    if (state.combatState) {
      const entry = state.combatState.initiativeOrder.find(
        e => e.type === 'enemy' && e.sourceId === enemyId
      )
      if (entry) {
        dispatch({
          type: 'UPDATE_COMBAT_ENTRY',
          payload: {
            entryId: entry.id,
            updates: { currentPv: newPv, isDefeated: false },
          },
        })
      }
    }
  }

  return (
    <div className="border-b border-stroke flex-shrink-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-muted hover:text-fg transition-colors"
      >
        <span>👹 Inimigos ({encounter.enemies.length})</span>
        <span className="text-[10px]">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="px-2 pb-2 space-y-1 max-h-[200px] overflow-y-auto">
          {encounter.enemies.map(enemy => {
            const pct = Math.max(0, Math.min(100, (enemy.currentPv / enemy.creature.pv) * 100))
            const isDead = enemy.currentPv <= 0
            return (
              <div
                key={enemy.id}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs ${
                  isDead ? 'opacity-40' : ''
                }`}
              >
                <span className="font-medium text-fg truncate flex-1 min-w-0">
                  {enemy.nickname || enemy.creature.name}
                </span>

                <button
                  onClick={() => handleDamage(enemy.id, enemy.currentPv, 1)}
                  className="w-5 h-5 rounded text-[10px] bg-red-500/20 text-red-400
                    hover:bg-red-500/30 transition-colors flex items-center justify-center"
                >
                  -
                </button>

                <div className="w-16 flex-shrink-0">
                  <div className="flex items-center justify-between text-[10px] text-muted mb-0.5">
                    <span>{enemy.currentPv}/{enemy.creature.pv}</span>
                  </div>
                  <div className="h-1 bg-stroke rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pct > 50 ? 'bg-green-500' : pct > 25 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleHeal(enemy.id, enemy.currentPv, enemy.creature.pv, 1)}
                  className="w-5 h-5 rounded text-[10px] bg-green-500/20 text-green-400
                    hover:bg-green-500/30 transition-colors flex items-center justify-center"
                >
                  +
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
