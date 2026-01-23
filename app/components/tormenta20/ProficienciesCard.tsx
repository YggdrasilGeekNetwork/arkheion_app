import { useState } from 'react'
import Card from './Card'
import Modal from './Modal'

type Proficiency = {
  name: string
  tooltip?: string
  visible?: boolean
}

type ProficienciesCardProps = {
  proficiencies: Proficiency[]
  onProficienciesChange?: (proficiencies: Proficiency[]) => void
}

const ProficienciesCard = ({ proficiencies, onProficienciesChange }: ProficienciesCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const toggleProficiency = (index: number) => {
    if (onProficienciesChange) {
      const updated = [...proficiencies]
      updated[index] = { ...updated[index], visible: !updated[index].visible }
      onProficienciesChange(updated)
    }
  }

  const visibleProficiencies = proficiencies.filter(p => p.visible !== false)

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm font-semibold">Proficiências</div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs px-2 py-0.5 bg-btn-bg border border-stroke rounded hover:bg-card-muted transition-colors"
          >
            Ver/Editar
          </button>
        </div>

        <div className="space-y-1">
          {visibleProficiencies.map((prof, index) => (
            <div key={index} className="flex items-start text-sm group relative">
              <span className="text-muted mr-1">•</span>
              <span className="text-muted flex-1">
                {prof.name} {prof.tooltip && <span className="opacity-50">?</span>}
              </span>
              {prof.tooltip && (
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-card border border-stroke rounded-lg p-2 shadow-lg z-10 w-48">
                  <div className="text-xs">{prof.tooltip}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Selecionar Proficiências"
      >
        <div className="space-y-3">
          {proficiencies.map((prof, index) => (
            <label
              key={index}
              className="flex items-center gap-3 p-2 rounded hover:bg-card-muted cursor-pointer"
            >
              <input
                type="checkbox"
                checked={prof.visible !== false}
                onChange={() => toggleProficiency(index)}
                className="cursor-pointer w-4 h-4"
              />
              <div className="flex-1">
                <div className="font-semibold text-sm">{prof.name}</div>
                {prof.tooltip && (
                  <div className="text-xs text-muted mt-0.5">{prof.tooltip}</div>
                )}
              </div>
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

export default ProficienciesCard
