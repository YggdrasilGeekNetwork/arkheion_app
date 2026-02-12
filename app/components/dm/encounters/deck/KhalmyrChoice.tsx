import type { Card } from '~/types/encounter'
import { CARD_TYPE_INFO } from '~/types/encounter'

type KhalmyrChoiceProps = {
  cards: Card[]
  onChoose: (card: Card) => void
  onCancel: () => void
}

export default function KhalmyrChoice({ cards, onChoose, onCancel }: KhalmyrChoiceProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-amber-300">
          ⚖️ Escolha uma carta:
        </div>
        <button
          onClick={onCancel}
          className="text-[10px] text-muted hover:text-fg"
        >
          Cancelar
        </button>
      </div>

      <div className="space-y-1.5">
        {cards.map((card) => {
          const typeInfo = CARD_TYPE_INFO[card.type]
          return (
            <button
              key={card.id}
              onClick={() => onChoose(card)}
              className="w-full text-left bg-bg border border-stroke rounded-md p-2
                hover:border-amber-500/50 hover:bg-amber-600/10
                transition-colors group"
            >
              <div className="flex items-center gap-1.5">
                <span>{typeInfo.icon}</span>
                <span className="font-medium text-xs text-fg group-hover:text-amber-200">
                  {card.name}
                </span>
              </div>
              <p className="text-[10px] text-muted mt-0.5 line-clamp-2">{card.description}</p>
              {card.subcategory && (
                <span className="text-[10px] text-muted opacity-60">
                  {card.subcategory}{card.tier ? ` · Tier ${card.tier}` : ''}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
