import { useMemo } from 'react'
import type { Encounter, Campaign } from '~/types/encounter'
import { calculateEncounterXP } from '~/data/xpTable'

type XPSummaryProps = {
  encounter: Encounter
  campaign: Campaign
  partySize?: number
}

export default function XPSummary({ encounter, campaign, partySize = 4 }: XPSummaryProps) {
  const { total, breakdown } = useMemo(
    () => calculateEncounterXP(
      encounter.enemies ?? [],
      encounter.encounterNpcs ?? [],
      campaign,
    ),
    [encounter.enemies, encounter.encounterNpcs, campaign]
  )

  if (breakdown.length === 0) {
    return (
      <div className="bg-surface border border-stroke rounded-md p-2">
        <div className="text-[10px] text-muted">Nenhum inimigo para calcular XP</div>
      </div>
    )
  }

  const xpPerPlayer = Math.floor(total / partySize)

  return (
    <div className="bg-surface border border-stroke rounded-md p-2 space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted font-medium">XP do Encontro</span>
        <span className="text-xs font-bold text-amber-400">{total.toLocaleString()} XP</span>
      </div>

      {/* Breakdown */}
      <div className="space-y-0.5">
        {breakdown.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-[10px]">
            <span className="text-muted">
              {item.name} {item.count > 1 ? `x${item.count}` : ''} (ND {item.nd})
            </span>
            <span className="text-fg font-mono">{item.xp.toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* Per player */}
      <div className="flex items-center justify-between pt-1 border-t border-stroke/30">
        <span className="text-[10px] text-muted">
          Por personagem ({partySize} PJs)
        </span>
        <span className="text-[10px] font-medium text-accent">{xpPerPlayer.toLocaleString()} XP</span>
      </div>
    </div>
  )
}
