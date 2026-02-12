import { useState } from 'react'
import type { CampaignObject, EncounterObject } from '~/types/encounter'
import { CAMPAIGN_OBJECT_TYPES, OBJECT_RARITY_INFO } from '~/types/encounter'
import { useMesa } from '~/contexts/MesaContext'
import Modal from '~/components/ui/Modal'
import ObjectForm from './ObjectForm'

type AddObjectModalProps = {
  isOpen: boolean
  onClose: () => void
}

type ModalTab = 'campaign' | 'create'

export default function AddObjectModal({ isOpen, onClose }: AddObjectModalProps) {
  const { state, dispatch } = useMesa()
  const [tab, setTab] = useState<ModalTab>('campaign')
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string | null>(null)

  const campaign = state.campaigns.find(c => c.id === state.activeCampaignId)
  const campaignObjects = campaign?.objects ?? []

  const filtered = campaignObjects.filter(o => {
    if (filterType && o.type !== filterType) return false
    return o.name.toLowerCase().includes(search.toLowerCase())
  })

  function handleAddFromCampaign(object: CampaignObject) {
    const encounterObject: EncounterObject = {
      id: `enc-obj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      objectId: object.id,
      quantity: 1,
    }
    dispatch({ type: 'ADD_OBJECT_TO_ENCOUNTER', payload: { encounterObject } })
    onClose()
  }

  function handleCreateAndAdd(object: CampaignObject) {
    dispatch({ type: 'CREATE_OBJECT', payload: { object } })

    const encounterObject: EncounterObject = {
      id: `enc-obj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      objectId: object.id,
      quantity: 1,
    }
    dispatch({ type: 'ADD_OBJECT_TO_ENCOUNTER', payload: { encounterObject } })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Objeto">
      <div className="flex flex-col h-[60vh]">
        {/* Tabs */}
        <div className="flex border-b border-stroke mb-3 flex-shrink-0">
          <button
            onClick={() => setTab('campaign')}
            className={`px-4 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors ${
              tab === 'campaign' ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-fg'
            }`}
          >
            📋 Campanha ({campaignObjects.length})
          </button>
          <button
            onClick={() => setTab('create')}
            className={`px-4 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors ${
              tab === 'create' ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-fg'
            }`}
          >
            ✏️ Criar Novo
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {tab === 'campaign' && (
            <div className="space-y-2">
              {/* Search + Filter */}
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar objeto..."
                className="w-full bg-surface border border-stroke rounded px-2 py-1.5 text-xs text-fg placeholder:text-muted/50 focus:outline-none focus:border-accent"
              />

              <div className="flex gap-1 flex-wrap">
                <button
                  onClick={() => setFilterType(null)}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                    !filterType ? 'border-accent/50 bg-accent/20 text-accent' : 'border-stroke text-muted hover:text-fg'
                  }`}
                >
                  Todos
                </button>
                {CAMPAIGN_OBJECT_TYPES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setFilterType(filterType === t.id ? null : t.id)}
                    className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                      filterType === t.id ? 'border-accent/50 bg-accent/20 text-accent' : 'border-stroke text-muted hover:text-fg'
                    }`}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              {campaignObjects.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-2xl mb-1 opacity-50">🎒</div>
                  <div className="text-xs text-muted mb-2">Nenhum objeto na campanha</div>
                  <button onClick={() => setTab('create')} className="text-[10px] text-accent hover:underline">
                    Criar primeiro objeto
                  </button>
                </div>
              )}

              {filtered.map(obj => {
                const typeInfo = CAMPAIGN_OBJECT_TYPES.find(t => t.id === obj.type)
                const rarityInfo = obj.rarity ? OBJECT_RARITY_INFO[obj.rarity] : null
                return (
                  <button
                    key={obj.id}
                    onClick={() => handleAddFromCampaign(obj)}
                    className="w-full text-left p-2 rounded-md border border-stroke hover:border-accent/30 hover:bg-bg/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs">{typeInfo?.icon ?? '📦'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-fg">{obj.name}</div>
                        {obj.description && (
                          <div className="text-[10px] text-muted line-clamp-1">{obj.description}</div>
                        )}
                      </div>
                      {rarityInfo && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${rarityInfo.color}`}>
                          {rarityInfo.label}
                        </span>
                      )}
                      {obj.value && (
                        <span className="text-[10px] text-amber-400">{obj.value}</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {tab === 'create' && <ObjectForm onAdd={handleCreateAndAdd} />}
        </div>
      </div>
    </Modal>
  )
}
