import { useState } from 'react'
import type { Creature, EncounterEnemy } from '~/types/encounter'
import { useMesa } from '~/contexts/MesaContext'
import Modal from '~/components/ui/Modal'
import CreatureSearchList from './CreatureSearchList'
import CreatureForm from './CreatureForm'

type AddEnemyModalProps = {
  isOpen: boolean
  onClose: () => void
}

type ModalTab = 'search' | 'create'

export default function AddEnemyModal({ isOpen, onClose }: AddEnemyModalProps) {
  const { dispatch } = useMesa()
  const [tab, setTab] = useState<ModalTab>('search')

  function handleAdd(creature: Creature, quantity: number) {
    for (let i = 0; i < quantity; i++) {
      const enemy: EncounterEnemy = {
        id: `enemy-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        creatureId: creature.id,
        creature: { ...creature },
        nickname: quantity > 1 ? `${creature.name} #${i + 1}` : undefined,
        currentPv: creature.pv,
        addedAt: new Date().toISOString(),
      }
      dispatch({ type: 'ADD_ENEMY_TO_ENCOUNTER', payload: { enemy } })
    }
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Inimigo">
      <div className="flex flex-col h-[60vh]">
        {/* Tabs */}
        <div className="flex border-b border-stroke mb-3 flex-shrink-0">
          <button
            onClick={() => setTab('search')}
            className={`px-4 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors ${
              tab === 'search'
                ? 'border-accent text-accent'
                : 'border-transparent text-muted hover:text-fg'
            }`}
          >
            🔍 Buscar
          </button>
          <button
            onClick={() => setTab('create')}
            className={`px-4 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors ${
              tab === 'create'
                ? 'border-accent text-accent'
                : 'border-transparent text-muted hover:text-fg'
            }`}
          >
            ✏️ Criar
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden min-h-0">
          {tab === 'search' && <CreatureSearchList onAdd={handleAdd} />}
          {tab === 'create' && <CreatureForm onAdd={handleAdd} />}
        </div>
      </div>
    </Modal>
  )
}
