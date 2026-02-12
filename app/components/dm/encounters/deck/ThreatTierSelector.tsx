import { THREAT_TIERS } from '~/types/encounter'

type ThreatTierSelectorProps = {
  selectedTier: number | null
  onSelect: (tier: number) => void
}

export default function ThreatTierSelector({ selectedTier, onSelect }: ThreatTierSelectorProps) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] font-medium text-muted uppercase tracking-wider">
        Tier de Ameaça
      </div>
      <div className="grid grid-cols-2 gap-1">
        {THREAT_TIERS.map((tier, index) => (
          <button
            key={tier.id}
            onClick={() => onSelect(index + 1)}
            className={`
              px-2 py-1 rounded text-[10px] font-medium transition-colors
              ${selectedTier === index + 1
                ? 'bg-red-600/20 border border-red-500/50 text-red-300'
                : 'bg-bg border border-stroke text-muted hover:border-red-500/30'
              }
            `}
          >
            <div>{tier.label}</div>
            <div className="opacity-60">{tier.ndRange}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
