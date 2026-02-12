import { useState } from 'react'
import type { Adventure, CardType, DrawnCard } from '~/types/encounter'
import { CARD_TYPE_INFO } from '~/types/encounter'
import { useMesa } from '~/contexts/MesaContext'

type AdventureSummaryProps = {
  adventure: Adventure
}

const TYPE_COLORS: Record<CardType, string> = {
  plot: 'border-l-purple-500',
  location: 'border-l-emerald-500',
  character: 'border-l-blue-500',
  object: 'border-l-amber-500',
  threat: 'border-l-red-500',
  event: 'border-l-cyan-500',
}

export default function AdventureSummary({ adventure }: AdventureSummaryProps) {
  const { dispatch } = useMesa()
  const drawnCards = adventure.drawnCards ?? []
  const [expandedCard, setExpandedCard] = useState<number | null>(null)

  if (drawnCards.length === 0) {
    return (
      <div className="text-center py-2">
        <div className="text-[10px] text-muted opacity-60">
          Nenhuma carta na aventura
        </div>
      </div>
    )
  }

  // Agrupar cartas por tipo
  const grouped: Record<string, { cards: DrawnCard[]; indices: number[] }> = {}
  drawnCards.forEach((card, index) => {
    if (!grouped[card.type]) grouped[card.type] = { cards: [], indices: [] }
    grouped[card.type].cards.push(card)
    grouped[card.type].indices.push(index)
  })

  const typeOrder: CardType[] = ['plot', 'location', 'character', 'object', 'threat', 'event']

  function handleRemove(cardIndex: number) {
    dispatch({ type: 'REMOVE_CARD_FROM_ADVENTURE', payload: { cardIndex } })
    if (expandedCard === cardIndex) setExpandedCard(null)
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-muted uppercase tracking-wider">
          Resumo ({drawnCards.length})
        </span>
        <button
          onClick={() => dispatch({ type: 'CLEAR_ADVENTURE_CARDS' })}
          className="text-[10px] text-muted hover:text-red-400 transition-colors"
        >
          Limpar
        </button>
      </div>

      <div className="space-y-1 max-h-48 overflow-y-auto">
        {typeOrder.map(type => {
          const group = grouped[type]
          if (!group) return null
          const info = CARD_TYPE_INFO[type]
          const colorClass = TYPE_COLORS[type]

          return (
            <div key={type} className="space-y-0.5">
              <div className="text-[10px] text-muted font-medium flex items-center gap-1">
                <span>{info.icon}</span>
                <span>{info.labelPt}</span>
                <span className="opacity-40">({group.cards.length})</span>
              </div>

              {group.cards.map((card, groupIdx) => {
                const realIndex = group.indices[groupIdx]
                const isExpanded = expandedCard === realIndex
                const methodIcon = card.method === 'nimb' ? '🎲' : '⚖️'

                return (
                  <div
                    key={`${card.id}-${realIndex}`}
                    className={`
                      border-l-2 ${colorClass} bg-bg/50 rounded-r px-2 py-1 group
                    `}
                  >
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setExpandedCard(isExpanded ? null : realIndex)}
                        className="flex-1 flex items-center gap-1 text-left min-w-0"
                      >
                        <span className="text-[10px] opacity-50">{methodIcon}</span>
                        <span className="text-[10px] font-medium text-fg truncate">{card.name}</span>
                        {card.isCustom && (
                          <span className="text-[8px] bg-accent/20 text-accent px-1 rounded flex-shrink-0">
                            custom
                          </span>
                        )}
                        <span className="text-[9px] text-muted opacity-0 group-hover:opacity-50 ml-auto flex-shrink-0">
                          {isExpanded ? '▲' : '▼'}
                        </span>
                      </button>
                      <button
                        onClick={() => handleRemove(realIndex)}
                        className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-400
                          transition-opacity text-[10px] flex-shrink-0"
                      >
                        ✕
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-1 space-y-0.5">
                        <p className="text-[10px] text-muted leading-relaxed">
                          {card.description}
                        </p>
                        {card.subcategory && (
                          <div className="text-[9px] text-muted opacity-50">
                            {card.subcategory}{card.tier ? ` · Tier ${card.tier}` : ''}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
