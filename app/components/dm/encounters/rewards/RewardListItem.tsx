import type { Reward, CampaignObject } from '~/types/encounter'
import { REWARD_TYPE_INFO } from '~/types/encounter'
import { useMesa } from '~/contexts/MesaContext'

type RewardListItemProps = {
  reward: Reward
  linkedObject?: CampaignObject
}

export default function RewardListItem({ reward, linkedObject }: RewardListItemProps) {
  const { dispatch } = useMesa()
  const typeInfo = REWARD_TYPE_INFO[reward.type]

  function toggleDistributed() {
    dispatch({
      type: 'TOGGLE_REWARD_DISTRIBUTED',
      payload: { rewardId: reward.id },
    })
  }

  function handleRemove() {
    dispatch({
      type: 'REMOVE_REWARD',
      payload: { rewardId: reward.id },
    })
  }

  return (
    <div className={`bg-surface border border-stroke rounded-md px-2 py-1.5 flex items-center gap-2
      ${reward.distributed ? 'opacity-60' : ''}`}
    >
      {/* Checkbox */}
      <button
        onClick={toggleDistributed}
        className={`w-4 h-4 flex items-center justify-center rounded border text-[10px] transition-colors ${
          reward.distributed
            ? 'border-green-500/50 bg-green-500/20 text-green-400'
            : 'border-stroke text-muted hover:border-accent/50'
        }`}
      >
        {reward.distributed ? '✓' : ''}
      </button>

      {/* Icon */}
      <span className="text-xs">{typeInfo.icon}</span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className={`text-xs font-medium ${reward.distributed ? 'line-through text-muted' : 'text-fg'}`}>
            {reward.name}
          </span>
          {reward.value != null && (
            <span className="text-[10px] text-amber-400 font-mono">
              {reward.type === 'gold' ? `${reward.value.toLocaleString()} TO` : reward.value.toLocaleString()}
            </span>
          )}
          {reward.quantity != null && reward.quantity > 1 && (
            <span className="text-[10px] text-muted">x{reward.quantity}</span>
          )}
        </div>
        {reward.description && (
          <div className="text-[10px] text-muted line-clamp-1">{reward.description}</div>
        )}
        {linkedObject && (
          <div className="text-[9px] text-accent/70">Objeto da campanha</div>
        )}
      </div>

      {/* Remove */}
      <button
        onClick={handleRemove}
        className="text-muted hover:text-red-400 text-xs p-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        style={{ opacity: 1 }}
      >
        ✕
      </button>
    </div>
  )
}
