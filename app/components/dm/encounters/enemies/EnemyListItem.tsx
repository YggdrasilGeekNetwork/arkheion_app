import { useState } from 'react'
import type { EncounterEnemy } from '~/types/encounter'
import { useMesa } from '~/contexts/MesaContext'
import EnemyStatBlock from './EnemyStatBlock'

type EnemyListItemProps = {
  enemy: EncounterEnemy
}

export default function EnemyListItem({ enemy }: EnemyListItemProps) {
  const { dispatch } = useMesa()
  const [expanded, setExpanded] = useState(false)
  const [pvDelta, setPvDelta] = useState('')

  const { creature, currentPv, nickname } = enemy
  const pvPercent = Math.max(0, Math.min(100, (currentPv / creature.pv) * 100))
  const pvColor = pvPercent > 50 ? 'bg-green-500' : pvPercent > 25 ? 'bg-amber-500' : 'bg-red-500'

  function applyDamage(amount: number) {
    const newPv = Math.max(0, Math.min(creature.pv, currentPv - amount))
    dispatch({
      type: 'UPDATE_ENEMY_IN_ENCOUNTER',
      payload: { enemyId: enemy.id, updates: { currentPv: newPv } },
    })
    setPvDelta('')
  }

  function handleRemove() {
    dispatch({
      type: 'REMOVE_ENEMY_FROM_ENCOUNTER',
      payload: { enemyId: enemy.id },
    })
  }

  return (
    <div className="bg-surface border border-stroke rounded-md overflow-hidden">
      {/* Compact row */}
      <div
        className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-bg/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-xs">{expanded ? '▾' : '▸'}</span>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-medium text-fg truncate">
              {nickname || creature.name}
            </span>
            {nickname && (
              <span className="text-[10px] text-muted">({creature.name})</span>
            )}
            {creature.isCustom && (
              <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1 rounded">custom</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] flex-shrink-0">
          <span className="text-muted">ND {creature.nd}</span>
          <span className="text-accent">CA {creature.ca}</span>
        </div>

        {/* PV bar */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <div className="w-16 h-2 bg-bg rounded-full overflow-hidden">
            <div className={`h-full ${pvColor} transition-all`} style={{ width: `${pvPercent}%` }} />
          </div>
          <span className="text-[10px] text-fg font-mono w-12 text-right">
            {currentPv}/{creature.pv}
          </span>
        </div>
      </div>

      {/* Expanded: stat block + actions */}
      {expanded && (
        <div className="border-t border-stroke/50 px-2 py-2 space-y-2">
          <EnemyStatBlock creature={creature} />

          {/* PV controls */}
          <div className="flex items-center gap-1.5 pt-1 border-t border-stroke/30">
            <span className="text-[10px] text-muted">PV:</span>
            <button
              onClick={(e) => { e.stopPropagation(); applyDamage(1) }}
              className="px-1.5 py-0.5 text-[10px] bg-red-500/20 text-red-300 rounded hover:bg-red-500/30"
            >
              -1
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); applyDamage(5) }}
              className="px-1.5 py-0.5 text-[10px] bg-red-500/20 text-red-300 rounded hover:bg-red-500/30"
            >
              -5
            </button>
            <input
              value={pvDelta}
              onChange={(e) => setPvDelta(e.target.value.replace(/[^0-9-]/g, ''))}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && pvDelta) {
                  applyDamage(parseInt(pvDelta) || 0)
                }
              }}
              placeholder="dano"
              className="w-12 px-1 py-0.5 text-[10px] bg-bg border border-stroke rounded text-center text-fg placeholder:text-muted/50"
            />
            <button
              onClick={(e) => { e.stopPropagation(); applyDamage(-1) }}
              className="px-1.5 py-0.5 text-[10px] bg-green-500/20 text-green-300 rounded hover:bg-green-500/30"
            >
              +1
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); applyDamage(-5) }}
              className="px-1.5 py-0.5 text-[10px] bg-green-500/20 text-green-300 rounded hover:bg-green-500/30"
            >
              +5
            </button>

            <div className="flex-1" />

            <button
              onClick={(e) => { e.stopPropagation(); handleRemove() }}
              className="px-1.5 py-0.5 text-[10px] text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded"
            >
              Remover
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
