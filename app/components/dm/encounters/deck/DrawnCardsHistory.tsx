import type { DrawnCard } from '~/types/encounter'
import { CARD_TYPE_INFO } from '~/types/encounter'

type DrawnCardsHistoryProps = {
  cards: DrawnCard[]
  onClear: () => void
  onRemoveCard?: (index: number) => void
}

export default function DrawnCardsHistory({ cards, onClear, onRemoveCard }: DrawnCardsHistoryProps) {
  if (cards.length === 0) return null

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-muted uppercase tracking-wider">
          Histórico ({cards.length})
        </span>
        <button
          onClick={onClear}
          className="text-[10px] text-muted hover:text-red-400 transition-colors"
        >
          Limpar
        </button>
      </div>

      <div className="space-y-1 max-h-32 overflow-y-auto">
        {[...cards].reverse().map((card, reverseIdx) => {
          const realIndex = cards.length - 1 - reverseIdx
          const typeInfo = CARD_TYPE_INFO[card.type]
          return (
            <div
              key={`${card.id}-${realIndex}`}
              className="flex items-center gap-1.5 px-2 py-1 bg-bg/50 rounded text-[10px] text-muted group"
            >
              <span>{typeInfo.icon}</span>
              <span className="flex-1 truncate">{card.name}</span>
              <span className="opacity-50">
                {card.method === 'nimb' ? '🎲' : '⚖️'}
              </span>
              {onRemoveCard && (
                <button
                  onClick={() => onRemoveCard(realIndex)}
                  className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-400 transition-opacity ml-1"
                >
                  ✕
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
