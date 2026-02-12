import Modal from '~/components/ui/Modal'
import type { PartySnapshotField } from '~/types/mesa'

type ConfigureFieldsModalProps = {
  isOpen: boolean
  onClose: () => void
  fields: PartySnapshotField[]
  onToggleField: (fieldId: string) => void
}

export default function ConfigureFieldsModal({
  isOpen,
  onClose,
  fields,
  onToggleField,
}: ConfigureFieldsModalProps) {
  const sortedFields = [...fields].sort((a, b) => a.order - b.order)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configurar Campos Visíveis">
      <div className="space-y-2">
        <p className="text-sm text-muted mb-4">
          Selecione quais campos devem aparecer na tabela de personagens.
        </p>

        <div className="grid grid-cols-2 gap-2">
          {sortedFields.map(field => (
            <label
              key={field.id}
              className="flex items-center gap-2 p-2 bg-card-muted rounded-lg cursor-pointer hover:bg-btn-bg transition-colors"
            >
              <input
                type="checkbox"
                checked={field.visible}
                onChange={() => onToggleField(field.id)}
                className="w-4 h-4 rounded border-stroke accent-accent"
              />
              <span className="text-sm">{field.label}</span>
            </label>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-stroke flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-accent text-card rounded hover:bg-accent-hover transition-colors font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  )
}
