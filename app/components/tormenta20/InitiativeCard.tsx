import { useState } from 'react'
import { useDiceRoll } from '~/contexts/DiceRollContext'
import Modal from './Modal'

type InitiativeCardProps = {
  attributes: { label: string; modifier: number }[]
  onSwitchToCombat?: () => void
}

const InitiativeCard = ({ attributes, onSwitchToCombat }: InitiativeCardProps) => {
  const desAttribute = attributes.find((attr) => attr.label === 'DES')
  const attrModifier = desAttribute ? desAttribute.modifier : 0
  const { addRoll } = useDiceRoll()
  const [showModal, setShowModal] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    addRoll('Iniciativa', attrModifier)
    if (onSwitchToCombat) {
      setShowModal(true)
    }
  }

  const handleSwitchToCombat = () => {
    setShowModal(false)
    if (onSwitchToCombat) {
      onSwitchToCombat()
    }
  }

  return (
    <>
      <div className="bg-card border border-stroke rounded-lg p-2">
        <div className="flex items-center justify-between text-xs min-h-[20px]">
          <span className="font-semibold text-muted">Iniciativa</span>
          <span
            onClick={handleClick}
            className="cursor-pointer hover:text-accent transition-colors border-b border-dotted border-current font-bold"
            title={`Clique para rolar d20${attrModifier >= 0 ? '+' : ''}${attrModifier}`}
          >
            {attrModifier >= 0 ? '+' : ''}{attrModifier}
          </span>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Ir para Combate?"
      >
        <div className="text-sm mb-4">
          Deseja ir para a aba de Combate?
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSwitchToCombat}
            className="flex-1 py-2 bg-accent text-card border border-stroke rounded hover:bg-opacity-90 transition-colors font-semibold"
          >
            Sim
          </button>
          <button
            onClick={() => setShowModal(false)}
            className="flex-1 py-2 bg-btn-bg border border-stroke rounded hover:bg-card-muted transition-colors font-semibold"
          >
            Não
          </button>
        </div>
      </Modal>
    </>
  )
}

export default InitiativeCard
