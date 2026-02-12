import { useState } from 'react'
import type { Creature, CreatureType } from '~/types/encounter'
import { CREATURE_TYPES } from '~/types/encounter'
import { CREATURES, ND_RANGES } from '~/data/creatures'
import EnemyStatBlock from './EnemyStatBlock'

type CreatureSearchListProps = {
  onAdd: (creature: Creature, quantity: number) => void
}

export default function CreatureSearchList({ onAdd }: CreatureSearchListProps) {
  const [search, setSearch] = useState('')
  const [ndFilter, setNdFilter] = useState<{ min: number; max: number } | null>(null)
  const [typeFilter, setTypeFilter] = useState<CreatureType | null>(null)
  const [selected, setSelected] = useState<Creature | null>(null)
  const [quantity, setQuantity] = useState(1)

  const filtered = CREATURES.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
    if (ndFilter && (c.nd < ndFilter.min || c.nd > ndFilter.max)) return false
    if (typeFilter && c.type !== typeFilter) return false
    return true
  })

  function handleConfirmAdd() {
    if (!selected) return
    onAdd(selected, quantity)
    setSelected(null)
    setQuantity(1)
  }

  return (
    <div className="flex flex-col gap-2 h-full">
      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar criatura..."
        className="w-full bg-surface border border-stroke rounded px-2 py-1.5 text-xs text-fg placeholder:text-muted/50"
      />

      {/* ND filter chips */}
      <div className="flex flex-wrap gap-1">
        <button
          onClick={() => setNdFilter(null)}
          className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
            !ndFilter ? 'bg-accent/20 text-accent' : 'bg-surface text-muted hover:text-fg'
          }`}
        >
          Todos
        </button>
        {ND_RANGES.map(r => (
          <button
            key={r.label}
            onClick={() => setNdFilter(ndFilter?.label === r.label ? null : r as any)}
            className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
              ndFilter?.min === r.min && ndFilter?.max === r.max
                ? 'bg-accent/20 text-accent'
                : 'bg-surface text-muted hover:text-fg'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-1">
        <button
          onClick={() => setTypeFilter(null)}
          className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
            !typeFilter ? 'bg-purple-500/20 text-purple-300' : 'bg-surface text-muted hover:text-fg'
          }`}
        >
          Todos
        </button>
        {CREATURE_TYPES.map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(typeFilter === t ? null : t)}
            className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
              typeFilter === t ? 'bg-purple-500/20 text-purple-300' : 'bg-surface text-muted hover:text-fg'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
        {filtered.length === 0 ? (
          <div className="text-center text-muted text-xs py-4">Nenhuma criatura encontrada</div>
        ) : (
          filtered.map(c => (
            <div
              key={c.id}
              onClick={() => setSelected(selected?.id === c.id ? null : c)}
              className={`rounded-md border p-2 cursor-pointer transition-colors ${
                selected?.id === c.id
                  ? 'border-accent bg-accent/5'
                  : 'border-stroke hover:border-accent/40 bg-surface'
              }`}
            >
              {selected?.id === c.id ? (
                <div className="space-y-2">
                  <EnemyStatBlock creature={c} />
                  <div className="flex items-center gap-2 pt-1.5 border-t border-stroke/50">
                    <span className="text-[10px] text-muted">Quantidade:</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setQuantity(Math.max(1, quantity - 1)) }}
                      className="w-5 h-5 flex items-center justify-center rounded bg-bg text-muted hover:text-fg text-xs"
                    >
                      -
                    </button>
                    <span className="text-xs font-mono w-4 text-center">{quantity}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setQuantity(quantity + 1) }}
                      className="w-5 h-5 flex items-center justify-center rounded bg-bg text-muted hover:text-fg text-xs"
                    >
                      +
                    </button>
                    <div className="flex-1" />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleConfirmAdd() }}
                      className="px-3 py-1 rounded text-[10px] font-medium bg-accent/20 text-accent hover:bg-accent/30 transition-colors"
                    >
                      Adicionar {quantity > 1 ? `(${quantity}x)` : ''}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs font-medium text-fg">{c.name}</span>
                    <span className="text-[10px] text-muted">{c.type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted flex-shrink-0">
                    <span>ND {c.nd}</span>
                    <span>CA {c.ca}</span>
                    <span>PV {c.pv}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
