import { useState } from 'react'
import type { NPC, EncounterNPC } from '~/types/encounter'
import { NPC_ALIGNMENT_INFO } from '~/types/encounter'
import { useMesa } from '~/contexts/MesaContext'
import Modal from '~/components/ui/Modal'
import NPCForm from './NPCForm'

type AddNPCModalProps = {
  isOpen: boolean
  onClose: () => void
}

type ModalTab = 'campaign' | 'create'

export default function AddNPCModal({ isOpen, onClose }: AddNPCModalProps) {
  const { state, dispatch } = useMesa()
  const [tab, setTab] = useState<ModalTab>('campaign')
  const [search, setSearch] = useState('')
  const [selectedNpcId, setSelectedNpcId] = useState<string | null>(null)
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null)

  const campaign = state.campaigns.find(c => c.id === state.activeCampaignId)
  const campaignNpcs = campaign?.npcs ?? []

  const filtered = campaignNpcs.filter(n =>
    n.name.toLowerCase().includes(search.toLowerCase()) ||
    (n.title ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const selectedNpc = campaignNpcs.find(n => n.id === selectedNpcId)

  function handleAddFromCampaign() {
    if (!selectedNpc) return
    const versionId = selectedVersionId ?? selectedNpc.versions[0]?.id
    if (!versionId) return

    const version = selectedNpc.versions.find(v => v.id === versionId)

    const encounterNpc: EncounterNPC = {
      id: `enc-npc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      npcId: selectedNpc.id,
      versionId,
      currentPv: version?.creature?.pv,
    }

    dispatch({ type: 'ADD_NPC_TO_ENCOUNTER', payload: { encounterNpc } })
    onClose()
    setSelectedNpcId(null)
    setSelectedVersionId(null)
  }

  function handleCreateAndAdd(npc: NPC) {
    dispatch({ type: 'CREATE_NPC', payload: { npc } })

    const encounterNpc: EncounterNPC = {
      id: `enc-npc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      npcId: npc.id,
      versionId: npc.versions[0].id,
      currentPv: npc.versions[0].creature?.pv,
    }

    dispatch({ type: 'ADD_NPC_TO_ENCOUNTER', payload: { encounterNpc } })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar NPC">
      <div className="flex flex-col h-[60vh]">
        {/* Tabs */}
        <div className="flex border-b border-stroke mb-3 flex-shrink-0">
          <button
            onClick={() => setTab('campaign')}
            className={`px-4 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors ${
              tab === 'campaign' ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-fg'
            }`}
          >
            📋 Campanha ({campaignNpcs.length})
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
              {/* Search */}
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar NPC..."
                className="w-full bg-surface border border-stroke rounded px-2 py-1.5 text-xs text-fg placeholder:text-muted/50 focus:outline-none focus:border-accent"
              />

              {campaignNpcs.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-2xl mb-1 opacity-50">👤</div>
                  <div className="text-xs text-muted mb-2">Nenhum NPC na campanha</div>
                  <button onClick={() => setTab('create')} className="text-[10px] text-accent hover:underline">
                    Criar primeiro NPC
                  </button>
                </div>
              )}

              {filtered.map(npc => {
                const isSelected = selectedNpcId === npc.id
                const alignInfo = NPC_ALIGNMENT_INFO[npc.alignment]
                return (
                  <div key={npc.id}>
                    <button
                      onClick={() => {
                        setSelectedNpcId(isSelected ? null : npc.id)
                        setSelectedVersionId(npc.versions[0]?.id ?? null)
                      }}
                      className={`w-full text-left p-2 rounded-md border transition-colors ${
                        isSelected
                          ? 'border-accent/50 bg-accent/5'
                          : 'border-stroke hover:border-accent/30 hover:bg-bg/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xs font-medium text-fg">{npc.name}</span>
                            {npc.title && <span className="text-[10px] text-muted italic">{npc.title}</span>}
                          </div>
                          {npc.description && (
                            <div className="text-[10px] text-muted mt-0.5 line-clamp-1">{npc.description}</div>
                          )}
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${alignInfo.color}`}>
                          {alignInfo.label}
                        </span>
                        {npc.isCombatant && (
                          <span className="text-[9px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-400">⚔️</span>
                        )}
                      </div>
                    </button>

                    {/* Version selection + Add button */}
                    {isSelected && (
                      <div className="ml-2 mt-1 p-2 bg-bg/50 rounded space-y-2">
                        {npc.versions.length > 1 && (
                          <div>
                            <div className="text-[10px] text-muted mb-1">Versão:</div>
                            <div className="flex gap-1 flex-wrap">
                              {npc.versions.map(v => (
                                <button
                                  key={v.id}
                                  onClick={() => setSelectedVersionId(v.id)}
                                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                                    selectedVersionId === v.id
                                      ? 'border-accent/50 bg-accent/20 text-accent'
                                      : 'border-stroke text-muted hover:text-fg'
                                  }`}
                                >
                                  {v.label}
                                  {v.creature && ` (ND ${v.creature.nd})`}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        <button
                          onClick={handleAddFromCampaign}
                          className="w-full text-xs font-medium py-1.5 rounded bg-accent/20 text-accent hover:bg-accent/30 transition-colors"
                        >
                          Adicionar ao Encontro
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {tab === 'create' && <NPCForm onAdd={handleCreateAndAdd} />}
        </div>
      </div>
    </Modal>
  )
}
