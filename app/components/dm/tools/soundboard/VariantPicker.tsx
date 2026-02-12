import type { SoundVariant } from '~/types/soundboard'

type VariantPickerProps = {
  variants: SoundVariant[]
  selectedId: string | null
  activeVariantId?: string
  onSelect: (variantId: string | null) => void
  onClose: () => void
}

export default function VariantPicker({
  variants, selectedId, activeVariantId, onSelect, onClose,
}: VariantPickerProps) {
  return (
    <div
      className="absolute z-20 top-full left-0 mt-0.5 bg-card border border-stroke
        rounded shadow-lg p-1 min-w-[110px] max-h-[140px] overflow-y-auto"
      onClick={e => e.stopPropagation()}
    >
      <button
        onClick={() => { onSelect(null); onClose() }}
        className={`w-full text-left text-[11px] px-1.5 py-0.5 rounded transition-colors
          ${selectedId === null
            ? 'bg-accent/20 text-accent'
            : 'text-muted hover:text-fg hover:bg-surface/50'
          }`}
      >
        🎲 Aleatório
      </button>
      {variants.map(v => (
        <button
          key={v.id}
          onClick={() => { onSelect(v.id); onClose() }}
          className={`w-full text-left text-[11px] px-1.5 py-0.5 rounded transition-colors flex items-center gap-1
            ${selectedId === v.id
              ? 'bg-accent/20 text-accent'
              : 'text-muted hover:text-fg hover:bg-surface/50'
            }`}
        >
          <span className="flex-1 truncate">{v.label || v.id}</span>
          {activeVariantId === v.id && (
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
          )}
        </button>
      ))}
    </div>
  )
}
