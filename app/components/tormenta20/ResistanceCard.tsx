import { useState } from 'react'
import Card from './Card'
import Rollable from './Rollable'
import Modal from './Modal'

type Resistance = {
  value: number
  name: string
  tooltip?: string
  visible?: boolean
}

type ResistanceCardProps = {
  resistances: Resistance[]
  onResistancesChange?: (resistances: Resistance[]) => void
}

const ResistanceCard = ({ resistances, onResistancesChange }: ResistanceCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const toggleResistance = (index: number) => {
    if (onResistancesChange) {
      const updated = [...resistances]
      updated[index] = { ...updated[index], visible: !updated[index].visible }
      onResistancesChange(updated)
    }
  }

  const visibleResistances = resistances.filter(r => r.visible !== false)

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm font-semibold">Resistências</div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs px-2 py-0.5 bg-btn-bg border border-stroke rounded hover:bg-card-muted transition-colors"
          >
            Ver/Editar
          </button>
        </div>

        <div className="space-y-1">
          {visibleResistances.map((res, index) => (
            <div key={index} className="flex justify-between text-sm group relative">
              <span className="text-muted">
                {res.name} {res.tooltip && <span className="opacity-50">?</span>}
              </span>
              <Rollable label={res.name} modifier={res.value}>
                <span className="font-bold">{res.value > 0 ? '+' : ''}{res.value}</span>
              </Rollable>
              {res.tooltip && (
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-card border border-stroke rounded-lg p-2 shadow-lg z-10 w-48">
                  <div className="text-xs">{res.tooltip}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Selecionar Perícias"
      >
        <div className="space-y-3">
          {resistances.map((res, index) => (
            <label
              key={index}
              className="flex items-center justify-between p-2 rounded hover:bg-card-muted cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={res.visible !== false}
                  onChange={() => toggleResistance(index)}
                  className="cursor-pointer w-4 h-4"
                />
                <div>
                  <div className="font-semibold text-sm">{res.name}</div>
                  {res.tooltip && (
                    <div className="text-xs text-muted mt-0.5">{res.tooltip}</div>
                  )}
                </div>
              </div>
              <span className="font-bold text-sm ml-2">{res.value > 0 ? '+' : ''}{res.value}</span>
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

export default ResistanceCard