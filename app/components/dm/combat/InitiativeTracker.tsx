import { useState } from 'react'
import { useMesa } from '~/contexts/MesaContext'
import { useSocketContext } from '~/contexts/SocketContext'
import { getActiveEncounter } from '~/reducers/mesaReducer'
import type { InitiativeEntry } from '~/types/combat'
import type { Creature } from '~/types/encounter'

const TYPE_ICONS: Record<InitiativeEntry['type'], string> = {
  player: '🧑',
  enemy: '👹',
  npc: '👤',
}

const CONDITIONS = [
  'Abalado', 'Apavorado', 'Atordoado', 'Caído', 'Cego',
  'Confuso', 'Desprevenido', 'Enjoado', 'Exausto', 'Fatigado',
  'Imóvel', 'Inconsciente', 'Lento', 'Surdo', 'Envenenado',
]

export default function InitiativeTracker() {
  const { state, dispatch } = useMesa()
  const { socket } = useSocketContext()
  const { combatState } = state
  const [showPendingWarning, setShowPendingWarning] = useState(false)

  if (!combatState) return null

  const isRolling = combatState.status === 'rolling_initiative'
  const isInProgress = combatState.status === 'in_progress'
  const allSet = combatState.initiativeOrder.every(e => e.initiative !== null)
  const pendingEntries = combatState.initiativeOrder.filter(e => e.initiative === null)
  const pendingCount = pendingEntries.length

  function handleStartCombat() {
    if (!allSet && pendingCount > 0) {
      setShowPendingWarning(true)
      return
    }
    startCombatNow()
  }

  function startCombatNow() {
    if (!combatState) return
    const withInitiative = combatState.initiativeOrder.filter(e => e.initiative !== null)
    const sorted = [...withInitiative].sort((a, b) => {
      const aInit = a.initiative ?? -999
      const bInit = b.initiative ?? -999
      if (bInit !== aInit) return bInit - aInit
      const typePriority = { player: 0, npc: 1, enemy: 2 }
      return typePriority[a.type] - typePriority[b.type]
    })
    dispatch({
      type: 'RESTORE_COMBAT',
      payload: {
        ...combatState,
        initiativeOrder: sorted,
        status: 'in_progress',
        currentTurnIndex: 0,
      },
    })
    setShowPendingWarning(false)
  }

  function updateEntry(entryId: string, updates: Partial<InitiativeEntry>) {
    // Emit conditions change to the player's character sheet via socket
    if (updates.conditions !== undefined && socket && state.mesa?.id) {
      const entry = combatState?.initiativeOrder.find(e => e.id === entryId)
      if (entry?.type === 'player') {
        socket.emit('character:conditions:update', {
          mesaId: state.mesa.id,
          characterId: entry.sourceId,
          conditions: updates.conditions,
        })
      }
    }
    dispatch({ type: 'UPDATE_COMBAT_ENTRY', payload: { entryId, updates } })
  }

  // Look up full creature data for enemy entries
  const currentEncounter = getActiveEncounter(state)

  return (
    <div className="flex-1 flex flex-col min-h-0 border-b border-stroke">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 flex-shrink-0">
        <span className="text-xs font-semibold text-muted">⚔️ Iniciativa</span>
        <div className="flex items-center gap-1.5">
          {isInProgress && (
            <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded-full">
              Rodada {combatState.round}
            </span>
          )}
          {isRolling && pendingCount > 0 && (
            <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full animate-pulse">
              {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Initiative list */}
      <div className="flex-1 overflow-y-auto min-h-0 px-2 space-y-0.5">
        {combatState.initiativeOrder.map((entry, index) => {
          const creature = entry.type === 'enemy'
            ? currentEncounter?.enemies.find((e) => e.id === entry.sourceId)?.creature
            : undefined
          return (
            <InitiativeRow
              key={entry.id}
              entry={entry}
              isCurrent={isInProgress && index === combatState.currentTurnIndex}
              creature={creature}
              onSetInitiative={(value) => {
                dispatch({ type: 'SET_INITIATIVE', payload: { entryId: entry.id, initiative: value } })
                // Sync to player's character sheet if this is a player entry
                if (entry.type === 'player' && socket && state.mesa?.id) {
                  socket.emit('character:initiative:update', {
                    mesaId: state.mesa.id,
                    characterId: entry.sourceId,
                    initiative: value,
                  })
                }
              }}
              onToggleDefeated={() => {
                updateEntry(entry.id, { isDefeated: !entry.isDefeated })
              }}
              onUpdate={(updates) => updateEntry(entry.id, updates)}
            />
          )
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1 px-2 py-1.5 flex-shrink-0">
        {isRolling && (
          <button
            onClick={handleStartCombat}
            className="flex-1 text-xs font-medium py-1.5 rounded transition-colors
              bg-green-600 text-white hover:bg-green-700"
          >
            Começar Combate
          </button>
        )}
        {isInProgress && (
          <>
            <button
              onClick={() => dispatch({ type: 'PREVIOUS_TURN' })}
              className="flex-1 text-xs text-muted border border-stroke rounded py-1.5
                hover:text-fg hover:border-accent/30 transition-colors"
            >
              ← Anterior
            </button>
            <button
              onClick={() => dispatch({ type: 'NEXT_TURN' })}
              className="flex-1 text-xs font-medium text-accent bg-accent/15
                border border-accent/40 rounded py-1.5
                hover:bg-accent/25 transition-colors"
            >
              Próximo →
            </button>
          </>
        )}
      </div>

      {/* Pending players warning popup */}
      {showPendingWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card border border-stroke rounded-lg p-4 max-w-sm mx-4">
            <h3 className="text-sm font-bold text-fg mb-2">Jogadores sem iniciativa</h3>
            <p className="text-xs text-muted mb-2">
              Os seguintes participantes não rolaram iniciativa e não serão incluídos no combate:
            </p>
            <ul className="text-xs text-yellow-400 space-y-0.5 mb-4 pl-2">
              {pendingEntries.map(e => (
                <li key={e.id} className="flex items-center gap-1.5">
                  <span>{TYPE_ICONS[e.type]}</span>
                  <span>{e.name}</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowPendingWarning(false)}
                className="px-3 py-1.5 text-xs text-muted hover:text-fg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={startCombatNow}
                className="px-3 py-1.5 text-xs font-medium text-white bg-green-600
                  rounded hover:bg-green-700 transition-colors"
              >
                Iniciar sem eles
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Individual initiative row with expandable details ──

function InitiativeRow({
  entry, isCurrent, creature, onSetInitiative, onToggleDefeated, onUpdate,
}: {
  entry: InitiativeEntry
  isCurrent: boolean
  creature?: Creature
  onSetInitiative: (value: number) => void
  onToggleDefeated: () => void
  onUpdate: (updates: Partial<InitiativeEntry>) => void
}) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [expanded, setExpanded] = useState(isCurrent)
  const [showConditionPicker, setShowConditionPicker] = useState(false)
  const [customCondition, setCustomCondition] = useState('')

  // Auto-expand when it becomes the current turn
  if (isCurrent && !expanded) setExpanded(true)

  const isPending = entry.initiative === null

  const pvPct = entry.maxPv
    ? Math.max(0, Math.min(100, ((entry.currentPv ?? 0) / entry.maxPv) * 100))
    : null

  const pmPct = entry.maxPm && entry.maxPm > 0
    ? Math.max(0, Math.min(100, ((entry.currentPm ?? 0) / entry.maxPm) * 100))
    : null

  function handleStartEdit() {
    setEditValue(entry.initiative?.toString() ?? '')
    setEditing(true)
  }

  function handleSave() {
    const val = parseInt(editValue)
    if (!isNaN(val)) onSetInitiative(val)
    setEditing(false)
  }

  function adjustPv(delta: number) {
    const current = entry.currentPv ?? 0
    const max = entry.maxPv ?? 999
    onUpdate({ currentPv: Math.max(0, Math.min(max, current + delta)) })
  }

  function adjustPm(delta: number) {
    const current = entry.currentPm ?? 0
    const max = entry.maxPm ?? 999
    onUpdate({ currentPm: Math.max(0, Math.min(max, current + delta)) })
  }

  function useAction(type: 'standard' | 'movement' | 'free') {
    const current = entry.availableActions ?? { standard: 0, movement: 0, free: 0 }
    if (current[type] <= 0) return
    onUpdate({ availableActions: { ...current, [type]: current[type] - 1 } })
  }

  function addCondition(condition: string) {
    if (!condition.trim()) return
    const existing = entry.conditions ?? []
    if (existing.includes(condition)) return
    onUpdate({ conditions: [...existing, condition] })
    setShowConditionPicker(false)
    setCustomCondition('')
  }

  function removeCondition(condition: string) {
    onUpdate({ conditions: (entry.conditions ?? []).filter(c => c !== condition) })
  }

  const conditions = entry.conditions ?? []
  const actions = entry.availableActions

  return (
    <div className={`rounded border transition-colors ${
      entry.isDefeated
        ? 'border-stroke opacity-40'
        : isCurrent
          ? 'border-accent/40 bg-accent/5'
          : 'border-transparent'
    }`}>
      {/* Main row */}
      <div
        className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs cursor-pointer ${
          entry.isDefeated ? '' : isCurrent ? '' : 'hover:bg-surface/50'
        }`}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Initiative value */}
        <div onClick={e => e.stopPropagation()}>
          {editing ? (
            <input
              type="number"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSave()
                if (e.key === 'Escape') setEditing(false)
              }}
              onBlur={handleSave}
              autoFocus
              className="w-8 text-center bg-accent/20 border border-accent/40 rounded
                text-xs text-accent font-bold outline-none"
            />
          ) : (
            <button
              onClick={handleStartEdit}
              className={`w-8 text-center rounded font-bold cursor-pointer transition-colors ${
                isPending
                  ? 'bg-yellow-500/20 text-yellow-400 animate-pulse text-[10px]'
                  : 'bg-surface/50 text-fg hover:bg-accent/20 hover:text-accent'
              }`}
            >
              {isPending ? '?' : entry.initiative}
            </button>
          )}
        </div>

        {/* Type icon */}
        <span className="text-sm flex-shrink-0">{TYPE_ICONS[entry.type]}</span>

        {/* Name */}
        <span className={`flex-1 truncate font-medium ${isCurrent ? 'text-accent' : 'text-fg'}`}>
          {entry.name}
        </span>

        {/* Condition chips (collapsed summary) */}
        {!expanded && conditions.length > 0 && (
          <div className="flex gap-0.5 flex-shrink-0">
            {conditions.slice(0, 2).map(c => (
              <span key={c} className="text-[8px] bg-orange-500/20 text-orange-400 px-1 rounded">
                {c}
              </span>
            ))}
            {conditions.length > 2 && (
              <span className="text-[8px] text-muted">+{conditions.length - 2}</span>
            )}
          </div>
        )}

        {/* Action dots — always visible when actions are tracked */}
        {!expanded && actions && (
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {[...Array(Math.max(0, actions.standard))].map((_, i) => (
              <span key={`s${i}`} className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Padrão" />
            ))}
            {[...Array(Math.max(0, actions.movement))].map((_, i) => (
              <span key={`m${i}`} className="w-1.5 h-1.5 rounded-full bg-green-500" title="Movimento" />
            ))}
            {[...Array(Math.max(0, actions.free))].map((_, i) => (
              <span key={`f${i}`} className="w-1.5 h-1.5 rounded-full bg-yellow-500" title="Livre" />
            ))}
          </div>
        )}

        {/* Mini HP bar */}
        {pvPct !== null && !expanded && (
          <div className="w-8 flex-shrink-0">
            <div className="h-1 bg-stroke rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  pvPct > 50 ? 'bg-green-500' : pvPct > 25 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${pvPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Defeated toggle */}
        {entry.type !== 'player' && (
          <div onClick={e => e.stopPropagation()}>
            <button
              onClick={onToggleDefeated}
              className={`text-[10px] flex-shrink-0 transition-colors ${
                entry.isDefeated ? 'text-red-400' : 'text-muted/30 hover:text-red-400'
              }`}
              title={entry.isDefeated ? 'Reviver' : 'Derrotar'}
            >
              💀
            </button>
          </div>
        )}

        {/* Expand indicator */}
        <span className={`text-[8px] text-muted/50 flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}>▼</span>

        {/* Current turn pulse */}
        {isCurrent && (
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse flex-shrink-0" />
        )}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-2 pb-2 space-y-2 border-t border-stroke/50 mt-0.5 pt-1.5">
          {/* PV */}
          {entry.maxPv !== undefined && (
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] text-muted font-semibold">PV</span>
                <span className="text-[10px] font-bold text-fg">
                  {entry.currentPv ?? 0}/{entry.maxPv}
                  {entry.ca !== undefined && <span className="text-muted ml-1.5">CA {entry.ca}</span>}
                </span>
              </div>
              <div className="h-1.5 bg-stroke rounded-full overflow-hidden mb-1">
                <div
                  className={`h-full rounded-full transition-all ${
                    (pvPct ?? 0) > 50 ? 'bg-green-500' : (pvPct ?? 0) > 25 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${pvPct ?? 0}%` }}
                />
              </div>
              <div className="flex gap-0.5">
                {[-5, -1, +1, +5].map(delta => (
                  <button
                    key={delta}
                    onClick={() => adjustPv(delta)}
                    className={`flex-1 text-[10px] py-0.5 rounded font-semibold transition-colors ${
                      delta < 0
                        ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                        : 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                    }`}
                  >
                    {delta > 0 ? '+' : ''}{delta}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PM */}
          {entry.maxPm !== undefined && (
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] text-muted font-semibold">PM</span>
                <span className="text-[10px] font-bold text-fg">{entry.currentPm ?? 0}/{entry.maxPm}</span>
              </div>
              <div className="h-1.5 bg-stroke rounded-full overflow-hidden mb-1">
                <div
                  className="h-full rounded-full bg-purple-500 transition-all"
                  style={{ width: `${pmPct ?? 0}%` }}
                />
              </div>
              <div className="flex gap-0.5">
                {[-3, -1, +1, +3].map(delta => (
                  <button
                    key={delta}
                    onClick={() => adjustPm(delta)}
                    className="flex-1 text-[10px] py-0.5 rounded font-semibold transition-colors bg-purple-900/30 text-purple-400 hover:bg-purple-900/50"
                  >
                    {delta > 0 ? '+' : ''}{delta}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Available actions — always visible when tracked */}
          {actions && (
            <div>
              <span className="text-[10px] text-muted font-semibold block mb-1">Ações</span>
              <div className="flex gap-1">
                {([
                  { key: 'standard' as const, label: 'Padrão', active: 'border-blue-500/50 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' },
                  { key: 'movement' as const, label: 'Movimento', active: 'border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/20' },
                  { key: 'free' as const, label: 'Livre', active: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20' },
                ] as const).map(({ key, label, active }) => {
                  const count = actions[key]
                  const used = count <= 0
                  return (
                    <button
                      key={key}
                      onClick={() => useAction(key)}
                      disabled={used}
                      className={`flex-1 flex flex-col items-center py-1 rounded border text-[9px] transition-colors disabled:cursor-not-allowed ${
                        used ? 'border-stroke bg-card/50 text-muted/30' : active
                      }`}
                    >
                      <span className="font-bold">{count}</span>
                      <span>{label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Enemy attacks */}
          {creature && creature.attacks.length > 0 && (
            <div>
              <span className="text-[10px] text-muted font-semibold block mb-1">Ataques</span>
              <div className="space-y-0.5">
                {creature.attacks.map((atk, i) => {
                  const canUse = isCurrent && (actions?.standard ?? 0) > 0
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        if (!canUse) return
                        useAction('standard')
                      }}
                      disabled={!canUse}
                      className={`w-full flex items-center justify-between px-2 py-1 rounded border text-[10px] transition-colors text-left ${
                        canUse
                          ? 'border-accent/30 bg-accent/5 hover:bg-accent/15 text-fg cursor-pointer'
                          : 'border-stroke/50 bg-card/50 text-muted/50 cursor-not-allowed'
                      }`}
                    >
                      <span className="font-medium">{atk.name}</span>
                      <span className="text-muted shrink-0 ml-2">
                        {atk.bonus >= 0 ? '+' : ''}{atk.bonus} • {atk.damage}
                        {atk.type && <span className="text-muted/60 ml-1">({atk.type})</span>}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Enemy abilities */}
          {creature?.abilities && creature.abilities.length > 0 && (
            <div>
              <span className="text-[10px] text-muted font-semibold block mb-1">Habilidades</span>
              <div className="space-y-0.5">
                {creature.abilities.map((ab, i) => (
                  <span
                    key={i}
                    className="block text-[9px] text-muted/80 bg-surface/30 px-1.5 py-0.5 rounded"
                  >
                    {ab}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Conditions */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted font-semibold">Condições</span>
              <button
                onClick={() => setShowConditionPicker(!showConditionPicker)}
                className="text-[9px] text-accent hover:text-accent/80 transition-colors"
              >
                + Add
              </button>
            </div>
            <div className="flex flex-wrap gap-0.5">
              {conditions.map(c => (
                <span
                  key={c}
                  className="inline-flex items-center gap-0.5 text-[9px] bg-orange-500/15 text-orange-400 border border-orange-500/30 px-1 py-0.5 rounded-full"
                >
                  {c}
                  <button onClick={() => removeCondition(c)} className="text-orange-500/60 hover:text-orange-400 leading-none">×</button>
                </span>
              ))}
              {conditions.length === 0 && (
                <span className="text-[9px] text-muted/50 italic">Nenhuma</span>
              )}
            </div>
            {showConditionPicker && (
              <div className="mt-1 p-1.5 bg-card-muted border border-stroke rounded space-y-1">
                <div className="flex flex-wrap gap-0.5">
                  {CONDITIONS.filter(c => !conditions.includes(c)).map(c => (
                    <button
                      key={c}
                      onClick={() => addCondition(c)}
                      className="text-[9px] bg-surface/50 text-fg border border-stroke px-1 py-0.5 rounded hover:border-accent hover:text-accent transition-colors"
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1">
                  <input
                    type="text"
                    placeholder="Customizada..."
                    value={customCondition}
                    onChange={e => setCustomCondition(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') addCondition(customCondition)
                      if (e.key === 'Escape') setShowConditionPicker(false)
                    }}
                    className="flex-1 text-[10px] px-1.5 py-0.5 bg-card border border-stroke rounded outline-none focus:border-accent"
                  />
                  <button
                    onClick={() => addCondition(customCondition)}
                    className="text-[10px] px-1.5 py-0.5 bg-accent text-card rounded hover:bg-accent-hover font-semibold"
                  >
                    OK
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
