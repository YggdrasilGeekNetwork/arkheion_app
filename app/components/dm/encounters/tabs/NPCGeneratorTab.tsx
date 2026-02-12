import { useState } from 'react'
import type { Encounter } from '~/types/encounter'
import { useMesa } from '~/contexts/MesaContext'
import NPCListItem from '../npcs/NPCListItem'
import AddNPCModal from '../npcs/AddNPCModal'

type NPCsTabProps = {
  encounter: Encounter
}

export default function NPCGeneratorTab({ encounter }: NPCsTabProps) {
  const { state } = useMesa()
  const [modalOpen, setModalOpen] = useState(false)

  const campaign = state.campaigns.find(c => c.id === state.activeCampaignId)
  const encounterNpcs = encounter.encounterNpcs ?? []

  return (
    <div className="h-full flex flex-col gap-2 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="text-xs text-muted">
          {encounterNpcs.length > 0
            ? `${encounterNpcs.length} NPC${encounterNpcs.length !== 1 ? 's' : ''}`
            : 'Nenhum NPC'}
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium
            bg-accent/20 text-accent hover:bg-accent/30 transition-colors"
        >
          <span>+</span>
          <span>Adicionar NPC</span>
        </button>
      </div>

      {/* NPC list */}
      <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
        {encounterNpcs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-8">
            <div className="text-2xl mb-1 opacity-50">👤</div>
            <div className="text-xs text-muted mb-2">Nenhum NPC neste encontro</div>
            <button
              onClick={() => setModalOpen(true)}
              className="text-[10px] text-accent hover:underline"
            >
              Adicionar NPC da campanha ou criar novo
            </button>
          </div>
        ) : (
          encounterNpcs.map(encNpc => {
            const npc = (campaign?.npcs ?? []).find(n => n.id === encNpc.npcId)
            if (!npc) return null
            return <NPCListItem key={encNpc.id} encounterNpc={encNpc} npc={npc} />
          })
        )}
      </div>

      <AddNPCModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
