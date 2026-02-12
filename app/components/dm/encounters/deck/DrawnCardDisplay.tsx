import type { Card } from '~/types/encounter'
import { CARD_TYPE_INFO } from '~/types/encounter'

type DrawnCardDisplayProps = {
  card: Card
  method: 'nimb' | 'khalmyr'
  onDismiss?: () => void
}

export default function DrawnCardDisplay({ card, method, onDismiss }: DrawnCardDisplayProps) {
  const typeInfo = CARD_TYPE_INFO[card.type]
  const methodLabel = method === 'nimb' ? '🎲 Nimb' : '⚖️ Khalmyr'

  return (
    <div className="bg-bg border border-accent/50 rounded-lg p-3 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-lg">{typeInfo.icon}</span>
          <div>
            <div className="font-semibold text-sm text-fg">{card.name}</div>
            <div className="text-[10px] text-muted">{typeInfo.labelPt} · {methodLabel}</div>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-muted hover:text-fg text-xs p-1"
          >
            ✕
          </button>
        )}
      </div>

      <p className="text-xs text-muted leading-relaxed">{card.description}</p>

      {card.subcategory && (
        <div className="mt-2 text-[10px] text-muted opacity-75">
          Categoria: {card.subcategory}
          {card.tier && ` · Tier ${card.tier}`}
        </div>
      )}
    </div>
  )
}
