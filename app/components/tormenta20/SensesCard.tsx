import { useState } from 'react'
import Card from './Card'
import Modal from './Modal'

type Sense = {
  name: string
  value: string | number
  tooltip?: string
  visible?: boolean
}

type SensesCardProps = {
  senses: Sense[]
  onSensesChange?: (senses: Sense[]) => void
}

const SensesCard = ({ senses, onSensesChange }: SensesCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const toggleSense = (index: number) => {
    if (onSensesChange) {
      const updated = [...senses]
      updated[index] = { ...updated[index], visible: !updated[index].visible }
      onSensesChange(updated)
    }
  }

  const visibleSenses = senses.filter(s => s.visible !== false)

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm font-semibold">Sentidos</div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs px-2 py-0.5 bg-btn-bg border border-stroke rounded hover:bg-card-muted transition-colors"
          >
            Ver/Editar
          </button>
        </div>

        <div className="space-y-1">
          {visibleSenses.map((sense, index) => (
            <div key={index} className="flex justify-between text-sm group relative">
              <span className="text-muted">
                {sense.name} {sense.tooltip && <span className="opacity-50">?</span>}
              </span>
              <span className="font-bold">{sense.value}</span>
              {sense.tooltip && (
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-card border border-stroke rounded-lg p-2 shadow-lg z-10 w-48">
                  <div className="text-xs">{sense.tooltip}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Selecionar Sentidos"
      >
        <div className="space-y-3">
          {senses.map((sense, index) => (
            <label
              key={index}
              className="flex items-center justify-between p-2 rounded hover:bg-card-muted cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={sense.visible !== false}
                  onChange={() => toggleSense(index)}
                  className="cursor-pointer w-4 h-4"
                />
                <div>
                  <div className="font-semibold text-sm">{sense.name}</div>
                  {sense.tooltip && (
                    <div className="text-xs text-muted mt-0.5">{sense.tooltip}</div>
                  )}
                </div>
              </div>
              <span className="font-bold text-sm ml-2">{sense.value}</span>
            </label>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-stroke">
          <button
            onClick={() => setIsModalOpen(false)}
            className="w-full py-2 bg-btn-bg border border-stroke rounded hover:bg-card-muted transition-colors font-semibold"
          >
            Concluir
          </button>
        </div>
      </Modal>
    </>
  )
}

export default SensesCard
