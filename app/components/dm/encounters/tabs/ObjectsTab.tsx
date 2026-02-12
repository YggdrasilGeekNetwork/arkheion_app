import { useState } from 'react'
import type { Encounter } from '~/types/encounter'
import { useMesa } from '~/contexts/MesaContext'
import ObjectListItem from '../objects/ObjectListItem'
import AddObjectModal from '../objects/AddObjectModal'

type ObjectsTabProps = {
  encounter: Encounter
}

export default function ObjectsTab({ encounter }: ObjectsTabProps) {
  const { state } = useMesa()
  const [modalOpen, setModalOpen] = useState(false)

  const campaign = state.campaigns.find(c => c.id === state.activeCampaignId)
  const encounterObjects = encounter.encounterObjects ?? []

  return (
    <div className="h-full flex flex-col gap-2 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="text-xs text-muted">
          {encounterObjects.length > 0
            ? `${encounterObjects.length} objeto${encounterObjects.length !== 1 ? 's' : ''}`
            : 'Nenhum objeto'}
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium
            bg-accent/20 text-accent hover:bg-accent/30 transition-colors"
        >
          <span>+</span>
          <span>Adicionar Objeto</span>
        </button>
      </div>

      {/* Object list */}
      <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
        {encounterObjects.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-8">
            <div className="text-2xl mb-1 opacity-50">🎒</div>
            <div className="text-xs text-muted mb-2">Nenhum objeto neste encontro</div>
            <button
              onClick={() => setModalOpen(true)}
              className="text-[10px] text-accent hover:underline"
            >
              Adicionar objeto da campanha ou criar novo
            </button>
          </div>
        ) : (
          encounterObjects.map(encObj => {
            const obj = (campaign?.objects ?? []).find(o => o.id === encObj.objectId)
            if (!obj) return null
            return <ObjectListItem key={encObj.id} encounterObject={encObj} object={obj} />
          })
        )}
      </div>

      <AddObjectModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
