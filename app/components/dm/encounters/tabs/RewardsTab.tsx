import { useState } from 'react'
import type { Encounter } from '~/types/encounter'
import { useMesa } from '~/contexts/MesaContext'
import XPSummary from '../rewards/XPSummary'
import RewardListItem from '../rewards/RewardListItem'
import AddRewardModal from '../rewards/AddRewardModal'

type RewardsTabProps = {
  encounter: Encounter
}

export default function RewardsTab({ encounter }: RewardsTabProps) {
  const { state } = useMesa()
  const [modalOpen, setModalOpen] = useState(false)

  const campaign = state.campaigns.find(c => c.id === state.activeCampaignId)
  const rewards = encounter.rewards ?? []
  const partySize = state.mesa?.characters.length || 4

  return (
    <div className="h-full flex flex-col gap-2 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="text-xs text-muted">
          {rewards.length > 0
            ? `${rewards.length} recompensa${rewards.length !== 1 ? 's' : ''}`
            : 'Nenhuma recompensa'}
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium
            bg-accent/20 text-accent hover:bg-accent/30 transition-colors"
        >
          <span>+</span>
          <span>Adicionar Recompensa</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        {/* XP Summary */}
        {campaign && (
          <XPSummary encounter={encounter} campaign={campaign} partySize={partySize} />
        )}

        {/* Rewards list */}
        {rewards.length > 0 && (
          <div className="space-y-1">
            <div className="text-[10px] text-muted font-medium px-0.5">Recompensas</div>
            {rewards.map(reward => {
              const linkedObject = reward.objectId
                ? (campaign?.objects ?? []).find(o => o.id === reward.objectId)
                : undefined
              return (
                <RewardListItem
                  key={reward.id}
                  reward={reward}
                  linkedObject={linkedObject}
                />
              )
            })}
          </div>
        )}

        {rewards.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-4">
            <div className="text-xs text-muted mb-2">Adicione ouro, itens ou outras recompensas</div>
            <button
              onClick={() => setModalOpen(true)}
              className="text-[10px] text-accent hover:underline"
            >
              + Adicionar recompensa
            </button>
          </div>
        )}
      </div>

      <AddRewardModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
