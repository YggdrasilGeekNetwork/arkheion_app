import { useState } from 'react'
import type { NPC, EncounterNPC } from '~/types/encounter'
import { NPC_ALIGNMENT_INFO } from '~/types/encounter'
import { useMesa } from '~/contexts/MesaContext'
import EnemyStatBlock from '../enemies/EnemyStatBlock'
import NPCVersionSelector from './NPCVersionSelector'
import NPCVersionForm from './NPCVersionForm'

type NPCListItemProps = {
  encounterNpc: EncounterNPC
  npc: NPC
}

export default function NPCListItem({ encounterNpc, npc }: NPCListItemProps) {
  const { dispatch } = useMesa()
  const [expanded, setExpanded] = useState(false)
  const [pvDelta, setPvDelta] = useState('')
  const [showVersionForm, setShowVersionForm] = useState(false)

  const activeVersion = npc.versions.find(v => v.id === encounterNpc.versionId) ?? npc.versions[0]
  const creature = activeVersion?.creature
  const alignmentInfo = NPC_ALIGNMENT_INFO[npc.alignment]

  const currentPv = encounterNpc.currentPv ?? creature?.pv ?? 0
  const maxPv = creature?.pv ?? 0
  const pvPercent = maxPv > 0 ? Math.max(0, Math.min(100, (currentPv / maxPv) * 100)) : 0
  const pvColor = pvPercent > 50 ? 'bg-green-500' : pvPercent > 25 ? 'bg-amber-500' : 'bg-red-500'

  function applyDamage(amount: number) {
    if (!creature) return
    const newPv = Math.max(0, Math.min(creature.pv, currentPv - amount))
    dispatch({
      type: 'UPDATE_NPC_IN_ENCOUNTER',
      payload: { encounterNpcId: encounterNpc.id, updates: { currentPv: newPv } },
    })
    setPvDelta('')
  }

  function handleRemove() {
    dispatch({
      type: 'REMOVE_NPC_FROM_ENCOUNTER',
      payload: { encounterNpcId: encounterNpc.id },
    })
  }

  function handleChangeVersion(versionId: string) {
    const version = npc.versions.find(v => v.id === versionId)
    dispatch({
      type: 'UPDATE_NPC_IN_ENCOUNTER',
      payload: {
        encounterNpcId: encounterNpc.id,
        updates: {
          versionId,
          currentPv: version?.creature?.pv,
        },
      },
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
            <span className="text-xs font-medium text-fg truncate">{npc.name}</span>
            {npc.title && <span className="text-[10px] text-muted italic truncate">{npc.title}</span>}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`text-[9px] px-1.5 py-0.5 rounded ${alignmentInfo.color} bg-current/10`}>
            <span className={alignmentInfo.color}>{alignmentInfo.label}</span>
          </span>
          {npc.isCombatant && (
            <span className="text-[9px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-400">⚔️</span>
          )}
        </div>

        {/* PV bar for combatants */}
        {creature && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="w-12 h-2 bg-bg rounded-full overflow-hidden">
              <div className={`h-full ${pvColor} transition-all`} style={{ width: `${pvPercent}%` }} />
            </div>
            <span className="text-[10px] text-fg font-mono w-10 text-right">
              {currentPv}/{maxPv}
            </span>
          </div>
        )}
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-stroke/50 px-2 py-2 space-y-2">
          {/* Version selector */}
          <NPCVersionSelector
            versions={npc.versions}
            activeVersionId={encounterNpc.versionId}
            onChange={handleChangeVersion}
          />

          {/* Description */}
          {(activeVersion?.description || npc.description) && (
            <div className="text-[10px] text-muted italic">
              {activeVersion?.description || npc.description}
            </div>
          )}

          {/* Stat block for combatants */}
          {creature && (
            <>
              <EnemyStatBlock creature={creature} />

              {/* PV controls */}
              <div className="flex items-center gap-1.5 pt-1 border-t border-stroke/30">
                <span className="text-[10px] text-muted">PV:</span>
                <button onClick={(e) => { e.stopPropagation(); applyDamage(1) }}
                  className="px-1.5 py-0.5 text-[10px] bg-red-500/20 text-red-300 rounded hover:bg-red-500/30">-1</button>
                <button onClick={(e) => { e.stopPropagation(); applyDamage(5) }}
                  className="px-1.5 py-0.5 text-[10px] bg-red-500/20 text-red-300 rounded hover:bg-red-500/30">-5</button>
                <input
                  value={pvDelta}
                  onChange={(e) => setPvDelta(e.target.value.replace(/[^0-9-]/g, ''))}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => { if (e.key === 'Enter' && pvDelta) applyDamage(parseInt(pvDelta) || 0) }}
                  placeholder="dano"
                  className="w-12 px-1 py-0.5 text-[10px] bg-bg border border-stroke rounded text-center text-fg placeholder:text-muted/50"
                />
                <button onClick={(e) => { e.stopPropagation(); applyDamage(-1) }}
                  className="px-1.5 py-0.5 text-[10px] bg-green-500/20 text-green-300 rounded hover:bg-green-500/30">+1</button>
                <button onClick={(e) => { e.stopPropagation(); applyDamage(-5) }}
                  className="px-1.5 py-0.5 text-[10px] bg-green-500/20 text-green-300 rounded hover:bg-green-500/30">+5</button>
              </div>
            </>
          )}

          {/* New version button */}
          {!showVersionForm && (
            <div className="flex items-center gap-2 pt-1 border-t border-stroke/30">
              <button
                onClick={(e) => { e.stopPropagation(); setShowVersionForm(true) }}
                className="text-[10px] text-accent hover:text-accent/80"
              >
                + Nova Versão
              </button>
              <div className="flex-1" />
              <button
                onClick={(e) => { e.stopPropagation(); handleRemove() }}
                className="text-[10px] text-red-400 hover:text-red-300"
              >
                Remover do Encontro
              </button>
            </div>
          )}

          {showVersionForm && (
            <NPCVersionForm
              isCombatant={npc.isCombatant}
              onAdd={(version) => {
                dispatch({ type: 'ADD_NPC_VERSION', payload: { npcId: npc.id, version } })
                handleChangeVersion(version.id)
                setShowVersionForm(false)
              }}
              onCancel={() => setShowVersionForm(false)}
            />
          )}
        </div>
      )}
    </div>
  )
}
