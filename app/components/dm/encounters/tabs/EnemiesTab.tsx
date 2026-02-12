import { useState } from 'react'
import type { Encounter } from '~/types/encounter'
import EnemyListItem from '../enemies/EnemyListItem'
import AddEnemyModal from '../enemies/AddEnemyModal'

type EnemiesTabProps = {
  encounter: Encounter
}

export default function EnemiesTab({ encounter }: EnemiesTabProps) {
  const [modalOpen, setModalOpen] = useState(false)

  const enemies = encounter.enemies ?? []

  return (
    <div className="h-full flex flex-col gap-2 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="text-xs text-muted">
          {enemies.length > 0
            ? `${enemies.length} inimigo${enemies.length !== 1 ? 's' : ''}`
            : 'Nenhum inimigo'}
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium
            bg-accent/20 text-accent hover:bg-accent/30 transition-colors"
        >
          <span>+</span>
          <span>Adicionar Inimigo</span>
        </button>
      </div>

      {/* Enemy list */}
      <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
        {enemies.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-8">
            <div className="text-2xl mb-1 opacity-50">👹</div>
            <div className="text-xs text-muted mb-2">Nenhum inimigo neste encontro</div>
            <button
              onClick={() => setModalOpen(true)}
              className="text-[10px] text-accent hover:underline"
            >
              Adicionar inimigo da lista ou criar personalizado
            </button>
          </div>
        ) : (
          enemies.map(enemy => (
            <EnemyListItem key={enemy.id} enemy={enemy} />
          ))
        )}
      </div>

      <AddEnemyModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
