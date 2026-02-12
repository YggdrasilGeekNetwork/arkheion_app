import { useState } from 'react'
import type { EncounterObject, CampaignObject } from '~/types/encounter'
import { CAMPAIGN_OBJECT_TYPES, OBJECT_RARITY_INFO } from '~/types/encounter'
import { useMesa } from '~/contexts/MesaContext'

type ObjectListItemProps = {
  encounterObject: EncounterObject
  object: CampaignObject
}

export default function ObjectListItem({ encounterObject, object }: ObjectListItemProps) {
  const { dispatch } = useMesa()
  const [expanded, setExpanded] = useState(false)

  const typeInfo = CAMPAIGN_OBJECT_TYPES.find(t => t.id === object.type)
  const rarityInfo = object.rarity ? OBJECT_RARITY_INFO[object.rarity] : null

  function updateQuantity(delta: number) {
    const newQty = Math.max(1, encounterObject.quantity + delta)
    dispatch({
      type: 'UPDATE_OBJECT_IN_ENCOUNTER',
      payload: { encounterObjectId: encounterObject.id, updates: { quantity: newQty } },
    })
  }

  function handleRemove() {
    dispatch({
      type: 'REMOVE_OBJECT_FROM_ENCOUNTER',
      payload: { encounterObjectId: encounterObject.id },
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

        <span className="text-xs">{typeInfo?.icon ?? '📦'}</span>

        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-fg truncate">{object.name}</span>
        </div>

        {rarityInfo && (
          <span className={`text-[9px] px-1.5 py-0.5 rounded ${rarityInfo.color}`}>
            {rarityInfo.label}
          </span>
        )}

        {/* Quantity */}
        <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => updateQuantity(-1)}
            className="w-4 h-4 flex items-center justify-center rounded bg-bg text-muted hover:text-fg text-[10px]"
          >-</button>
          <span className="text-[10px] font-mono w-4 text-center">{encounterObject.quantity}</span>
          <button
            onClick={() => updateQuantity(1)}
            className="w-4 h-4 flex items-center justify-center rounded bg-bg text-muted hover:text-fg text-[10px]"
          >+</button>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-stroke/50 px-2 py-2 space-y-1.5">
          {object.value && (
            <div className="text-[10px] text-muted">
              <span className="text-amber-400">Valor:</span> {object.value}
            </div>
          )}
          {object.description && (
            <div className="text-[10px] text-muted italic">{object.description}</div>
          )}
          {object.properties && object.properties.length > 0 && (
            <div className="space-y-0.5">
              <div className="text-[10px] text-accent font-medium">Propriedades:</div>
              {object.properties.map((prop, i) => (
                <div key={i} className="text-[10px] text-muted pl-2">• {prop}</div>
              ))}
            </div>
          )}
          {encounterObject.notes && (
            <div className="text-[10px] text-muted italic border-t border-stroke/30 pt-1">
              {encounterObject.notes}
            </div>
          )}
          <div className="flex justify-end pt-1 border-t border-stroke/30">
            <button
              onClick={(e) => { e.stopPropagation(); handleRemove() }}
              className="text-[10px] text-red-400 hover:text-red-300"
            >
              Remover do Encontro
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
