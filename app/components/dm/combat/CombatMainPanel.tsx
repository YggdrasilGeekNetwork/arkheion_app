import { useState } from 'react'
import { useMesa } from '~/contexts/MesaContext'
import type { InitiativeEntry } from '~/types/combat'

const CONDITIONS = [
  'Abalado', 'Apavorado', 'Atordoado', 'Caído', 'Cego',
  'Confuso', 'Desprevenido', 'Enjoado', 'Exausto', 'Fatigado',
  'Imóvel', 'Inconsciente', 'Lento', 'Surdo', 'Envenenado',
]

const TYPE_ICONS: Record<InitiativeEntry['type'], string> = {
  player: '🧑',
  enemy: '👹',
  npc: '👤',
}

export default function CombatMainPanel() {
  const { state, dispatch } = useMesa()
  const { combatState } = state

  if (!combatState || combatState.status !== 'in_progress') {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg">
        <p className="text-sm text-muted">Combate não iniciado</p>
      </div>
    )
  }

  const currentEntry = combatState.initiativeOrder[combatState.currentTurnIndex]

  function updateEntry(entryId: string, updates: Partial<InitiativeEntry>) {
    dispatch({ type: 'UPDATE_COMBAT_ENTRY', payload: { entryId, updates } })
  }

  return (
    <div className="flex-1 overflow-y-auto bg-bg p-3 space-y-2" style={{ scrollbarWidth: 'thin' }}>
      {combatState.initiativeOrder.map((entry) => (
        <EntrySheet
          key={entry.id}
          entry={entry}
          isActive={entry.id === currentEntry?.id}
          onUpdate={(updates) => updateEntry(entry.id, updates)}
        />
      ))}
    </div>
  )
}

// ── Individual entry sheet ──

function EntrySheet({
  entry,
  isActive,
  onUpdate,
}: {
  entry: InitiativeEntry
  isActive: boolean
  onUpdate: (updates: Partial<InitiativeEntry>) => void
}) {
  const [isOpen, setIsOpen] = useState(isActive)
  const [showConditionPicker, setShowConditionPicker] = useState(false)
  const [customCondition, setCustomCondition] = useState('')

  // Auto-open when it becomes active
  if (isActive && !isOpen) setIsOpen(true)

  const pvPct = entry.maxPv && entry.maxPv > 0
    ? Math.max(0, Math.min(100, ((entry.currentPv ?? 0) / entry.maxPv) * 100))
    : null

  const pmPct = entry.maxPm && entry.maxPm > 0
    ? Math.max(0, Math.min(100, ((entry.currentPm ?? 0) / entry.maxPm) * 100))
    : null

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

  const actions = entry.availableActions

  return (
    <div className={`border rounded-lg overflow-hidden transition-colors ${
      entry.isDefeated
        ? 'border-stroke opacity-40'
        : isActive
          ? 'border-accent/60 bg-accent/5'
          : 'border-stroke bg-card'
    }`}>
      {/* Header / toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-card-muted transition-colors text-left"
      >
        <span className="text-sm">{TYPE_ICONS[entry.type]}</span>
        <span className={`flex-1 text-sm font-semibold truncate ${isActive ? 'text-accent' : 'text-fg'}`}>
          {entry.name}
        </span>

        {isActive && (
          <span className="text-[10px] font-bold text-accent bg-accent/20 px-1.5 py-0.5 rounded-full flex-shrink-0">
            Turno atual
          </span>
        )}

        {/* Conditions summary */}
        {(entry.conditions ?? []).length > 0 && (
          <div className="flex gap-0.5 flex-shrink-0">
            {(entry.conditions ?? []).slice(0, 3).map(c => (
              <span key={c} className="text-[9px] bg-orange-500/20 text-orange-400 px-1 py-0.5 rounded">
                {c}
              </span>
            ))}
            {(entry.conditions ?? []).length > 3 && (
              <span className="text-[9px] text-muted">+{(entry.conditions ?? []).length - 3}</span>
            )}
          </div>
        )}

        {/* HP summary */}
        {pvPct !== null && (
          <span className={`text-[10px] font-bold flex-shrink-0 ${
            pvPct > 50 ? 'text-green-400' : pvPct > 25 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {entry.currentPv}/{entry.maxPv} PV
          </span>
        )}

        <span className={`text-xs text-muted transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="px-3 pb-3 space-y-3 border-t border-stroke">
          {/* PV Section */}
          {entry.maxPv !== undefined && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-muted">PV</span>
                <span className="text-xs font-bold text-fg">{entry.currentPv ?? 0} / {entry.maxPv}</span>
              </div>
              <div className="h-2 bg-stroke rounded-full overflow-hidden mb-1.5">
                <div
                  className={`h-full rounded-full transition-all ${
                    (pvPct ?? 0) > 50 ? 'bg-green-500' : (pvPct ?? 0) > 25 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${pvPct ?? 0}%` }}
                />
              </div>
              <div className="flex gap-1">
                {[-5, -1, +1, +5].map(delta => (
                  <button
                    key={delta}
                    onClick={() => adjustPv(delta)}
                    className={`flex-1 text-xs py-1 rounded font-semibold transition-colors ${
                      delta < 0
                        ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-800/40'
                        : 'bg-green-900/30 text-green-400 hover:bg-green-900/50 border border-green-800/40'
                    }`}
                  >
                    {delta > 0 ? '+' : ''}{delta}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PM Section */}
          {entry.maxPm !== undefined && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-muted">PM</span>
                <span className="text-xs font-bold text-fg">{entry.currentPm ?? 0} / {entry.maxPm}</span>
              </div>
              <div className="h-2 bg-stroke rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full rounded-full bg-purple-500 transition-all"
                  style={{ width: `${pmPct ?? 0}%` }}
                />
              </div>
              <div className="flex gap-1">
                {[-3, -1, +1, +3].map(delta => (
                  <button
                    key={delta}
                    onClick={() => adjustPm(delta)}
                    className={`flex-1 text-xs py-1 rounded font-semibold transition-colors ${
                      delta < 0
                        ? 'bg-purple-900/30 text-purple-400 hover:bg-purple-900/50 border border-purple-800/40'
                        : 'bg-purple-900/30 text-purple-300 hover:bg-purple-900/50 border border-purple-800/40'
                    }`}
                  >
                    {delta > 0 ? '+' : ''}{delta}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Available Actions */}
          {isActive && actions && (
            <div>
              <div className="text-xs font-semibold text-muted mb-1.5">Ações disponíveis</div>
              <div className="flex gap-1.5">
                <ActionButton
                  label="Padrão"
                  count={actions.standard}
                  color="accent"
                  onClick={() => useAction('standard')}
                />
                <ActionButton
                  label="Movimento"
                  count={actions.movement}
                  color="blue"
                  onClick={() => useAction('movement')}
                />
                <ActionButton
                  label="Livre"
                  count={actions.free}
                  color="green"
                  onClick={() => useAction('free')}
                />
              </div>
            </div>
          )}

          {/* Conditions */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-muted">Condições</span>
              <button
                onClick={() => setShowConditionPicker(!showConditionPicker)}
                className="text-[10px] text-accent hover:text-accent/80 transition-colors font-semibold"
              >
                + Adicionar
              </button>
            </div>

            {/* Active conditions */}
            <div className="flex flex-wrap gap-1">
              {(entry.conditions ?? []).map(condition => (
                <span
                  key={condition}
                  className="inline-flex items-center gap-1 text-[10px] bg-orange-500/15 text-orange-400 border border-orange-500/30 px-1.5 py-0.5 rounded-full"
                >
                  {condition}
                  <button
                    onClick={() => removeCondition(condition)}
                    className="text-orange-500/60 hover:text-orange-400 leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
              {(entry.conditions ?? []).length === 0 && (
                <span className="text-[10px] text-muted italic">Nenhuma condição</span>
              )}
            </div>

            {/* Condition picker */}
            {showConditionPicker && (
              <div className="mt-2 p-2 bg-card-muted border border-stroke rounded-lg space-y-2">
                <div className="flex flex-wrap gap-1">
                  {CONDITIONS.filter(c => !(entry.conditions ?? []).includes(c)).map(c => (
                    <button
                      key={c}
                      onClick={() => addCondition(c)}
                      className="text-[10px] bg-surface/50 text-fg border border-stroke px-1.5 py-0.5 rounded hover:border-accent hover:text-accent transition-colors"
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1">
                  <input
                    type="text"
                    placeholder="Condição customizada..."
                    value={customCondition}
                    onChange={e => setCustomCondition(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') addCondition(customCondition)
                      if (e.key === 'Escape') setShowConditionPicker(false)
                    }}
                    className="flex-1 text-xs px-2 py-1 bg-card border border-stroke rounded outline-none focus:border-accent"
                  />
                  <button
                    onClick={() => addCondition(customCondition)}
                    className="text-xs px-2 py-1 bg-accent text-card rounded hover:bg-accent-hover transition-colors font-semibold"
                  >
                    OK
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* CA and extra info for non-players */}
          {entry.type !== 'player' && entry.ca !== undefined && (
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="text-[10px] text-muted">CA</div>
                <div className="text-sm font-bold text-fg">{entry.ca}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ActionButton({
  label, count, color, onClick,
}: {
  label: string
  count: number
  color: 'accent' | 'blue' | 'green'
  onClick: () => void
}) {
  const used = count <= 0

  const colorClasses = {
    accent: used
      ? 'border-stroke bg-card-muted text-muted/30'
      : 'border-accent/50 bg-accent/10 text-accent hover:bg-accent/20',
    blue: used
      ? 'border-stroke bg-card-muted text-muted/30'
      : 'border-blue-500/50 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20',
    green: used
      ? 'border-stroke bg-card-muted text-muted/30'
      : 'border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/20',
  }[color]

  return (
    <button
      onClick={onClick}
      disabled={used}
      className={`flex-1 flex flex-col items-center py-1.5 rounded border transition-colors ${colorClasses} disabled:cursor-not-allowed`}
      title={used ? `${label} usada` : `Usar ação ${label.toLowerCase()}`}
    >
      <span className="text-[10px] font-bold">{count}</span>
      <span className="text-[9px]">{label}</span>
    </button>
  )
}
