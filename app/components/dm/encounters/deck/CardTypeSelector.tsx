import type { CardType } from '~/types/encounter'
import { CARD_TYPE_INFO } from '~/types/encounter'
import { getCardCount } from '~/data/adventureDeck'

type CardTypeSelectorProps = {
  selectedType: CardType | null
  onSelect: (type: CardType) => void
}

const CARD_TYPES: CardType[] = ['plot', 'location', 'character', 'object', 'threat', 'event']

export default function CardTypeSelector({ selectedType, onSelect }: CardTypeSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {CARD_TYPES.map((type) => {
        const info = CARD_TYPE_INFO[type]
        const count = getCardCount(type)
        const isSelected = selectedType === type

        return (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className={`
              flex flex-col items-center gap-0.5 p-1.5 rounded-md text-xs transition-colors
              ${isSelected
                ? 'bg-accent/20 border border-accent text-accent'
                : 'bg-bg border border-stroke text-muted hover:border-accent/50 hover:text-fg'
              }
            `}
          >
            <span className="text-base">{info.icon}</span>
            <span className="font-medium leading-tight">{info.labelPt}</span>
            <span className="text-[10px] opacity-60">{count}</span>
          </button>
        )
      })}
    </div>
  )
}
