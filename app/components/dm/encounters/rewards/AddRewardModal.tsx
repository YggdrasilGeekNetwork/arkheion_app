import { useState } from 'react'
import type { Reward, RewardType, CampaignObject } from '~/types/encounter'
import { REWARD_TYPE_INFO, CAMPAIGN_OBJECT_TYPES, OBJECT_RARITY_INFO } from '~/types/encounter'
import { useMesa } from '~/contexts/MesaContext'
import Modal from '~/components/ui/Modal'

type AddRewardModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function AddRewardModal({ isOpen, onClose }: AddRewardModalProps) {
  const { state, dispatch } = useMesa()
  const [type, setType] = useState<RewardType>('gold')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [value, setValue] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null)

  const campaign = state.campaigns.find(c => c.id === state.activeCampaignId)
  const campaignObjects = campaign?.objects ?? []

  function handleSubmit() {
    const rewardName = type === 'item' && selectedObjectId
      ? campaignObjects.find(o => o.id === selectedObjectId)?.name ?? name.trim()
      : name.trim()

    if (!rewardName) return

    const reward: Reward = {
      id: `reward-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      name: rewardName,
      description: description.trim() || undefined,
      value: value ? parseFloat(value) : undefined,
      quantity: quantity ? parseInt(quantity) : undefined,
      objectId: type === 'item' ? selectedObjectId ?? undefined : undefined,
      distributed: false,
    }

    dispatch({ type: 'ADD_REWARD', payload: { reward } })
    onClose()
    resetForm()
  }

  function resetForm() {
    setName('')
    setDescription('')
    setValue('')
    setQuantity('1')
    setSelectedObjectId(null)
  }

  const inputClass = 'w-full bg-surface border border-stroke rounded px-1.5 py-1 text-[10px] text-fg'
  const labelClass = 'text-[10px] text-muted font-medium'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Recompensa">
      <div className="space-y-3">
        {/* Reward type */}
        <div>
          <label className={labelClass}>Tipo</label>
          <div className="flex gap-1 mt-0.5">
            {(Object.entries(REWARD_TYPE_INFO) as [RewardType, { label: string; icon: string }][]).map(([key, info]) => (
              <button
                key={key}
                onClick={() => { setType(key); setSelectedObjectId(null) }}
                className={`flex-1 text-[10px] px-2 py-1.5 rounded border transition-colors ${
                  type === key
                    ? 'border-accent/50 bg-accent/20 text-accent'
                    : 'border-stroke text-muted hover:text-fg'
                }`}
              >
                {info.icon} {info.label}
              </button>
            ))}
          </div>
        </div>

        {/* Item from campaign */}
        {type === 'item' && campaignObjects.length > 0 && (
          <div>
            <label className={labelClass}>Objeto da Campanha (opcional)</label>
            <div className="max-h-32 overflow-y-auto space-y-1 mt-0.5">
              {campaignObjects.map(obj => {
                const typeInfo = CAMPAIGN_OBJECT_TYPES.find(t => t.id === obj.type)
                const rarityInfo = obj.rarity ? OBJECT_RARITY_INFO[obj.rarity] : null
                return (
                  <button
                    key={obj.id}
                    onClick={() => setSelectedObjectId(selectedObjectId === obj.id ? null : obj.id)}
                    className={`w-full text-left px-2 py-1 rounded border text-[10px] transition-colors ${
                      selectedObjectId === obj.id
                        ? 'border-accent/50 bg-accent/10'
                        : 'border-stroke hover:border-accent/30'
                    }`}
                  >
                    <span>{typeInfo?.icon} </span>
                    <span className="text-fg">{obj.name}</span>
                    {rarityInfo && <span className={` ml-1 ${rarityInfo.color}`}>({rarityInfo.label})</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Name (if not selecting from campaign) */}
        {!(type === 'item' && selectedObjectId) && (
          <div>
            <label className={labelClass}>Nome *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={type === 'gold' ? 'Moedas de ouro' : type === 'xp' ? 'XP Bônus' : 'Nome da recompensa'}
              className={inputClass}
            />
          </div>
        )}

        {/* Value + Quantity */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelClass}>
              {type === 'gold' ? 'Valor (TO)' : type === 'xp' ? 'Quantidade XP' : 'Valor'}
            </label>
            <input
              type="number"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder={type === 'gold' ? '100' : type === 'xp' ? '500' : '0'}
              className={inputClass}
            />
          </div>
          {type !== 'xp' && type !== 'gold' && (
            <div>
              <label className={labelClass}>Quantidade</label>
              <input
                type="number"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                min="1"
                className={inputClass}
              />
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>Descrição</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            placeholder="Notas sobre a recompensa..."
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-1 border-t border-stroke/50">
          <button
            onClick={handleSubmit}
            disabled={!(type === 'item' && selectedObjectId) && !name.trim()}
            className="px-4 py-1.5 rounded text-xs font-medium bg-accent/20 text-accent
              hover:bg-accent/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Adicionar Recompensa
          </button>
        </div>
      </div>
    </Modal>
  )
}
