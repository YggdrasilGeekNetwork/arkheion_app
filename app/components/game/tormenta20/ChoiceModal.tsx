import Modal from '~/components/ui/Modal'

type ChoiceModalProps = {
  isOpen: boolean
  onClose: () => void
  actionName: string
  choices: string[]
  onSelect: (choice: string) => void
}

const choiceLabels: Record<string, string> = {
  standard: 'Ação Padrão',
  movement: 'Ação de Movimento',
  free: 'Ação Livre',
  full: 'Ação Completa',
  reaction: 'Reação',
}

export default function ChoiceModal({
  isOpen,
  onClose,
  actionName,
  choices,
  onSelect,
}: ChoiceModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={actionName}>
      <div className="space-y-3">
        <p className="text-sm text-muted">Escolha o tipo de ação que deseja ganhar:</p>
        <div className="space-y-2">
          {choices.map((choice) => (
            <button
              key={choice}
              onClick={() => {
                onSelect(choice)
                onClose()
              }}
              className="w-full py-3 bg-card border-2 border-stroke rounded-lg hover:border-accent transition-colors font-semibold text-sm"
            >
              {choiceLabels[choice] || choice}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  )
}
