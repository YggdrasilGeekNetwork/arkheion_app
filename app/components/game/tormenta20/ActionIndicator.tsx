import type { AvailableActions } from '~/types/character'

type ActionIndicatorProps = {
  availableActions: AvailableActions
}

type ActionType = {
  key: keyof AvailableActions
  label: string
  color: string
}

const actionTypes: ActionType[] = [
  { key: 'standard', label: 'Padrão', color: 'bg-blue-500' },
  { key: 'movement', label: 'Movimento', color: 'bg-green-500' },
  { key: 'free', label: 'Livre', color: 'bg-yellow-500' },
  { key: 'full', label: 'Completa', color: 'bg-purple-500' },
  { key: 'reactions', label: 'Reação', color: 'bg-red-500' },
]

export default function ActionIndicator({ availableActions }: ActionIndicatorProps) {
  return (
    <div className="bg-card border border-stroke rounded-lg p-4 mb-2">
      <div className="flex items-center gap-3">
        <div className="text-sm font-bold text-muted tracking-widest" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
          AÇÕES
        </div>
        <div className="flex-1 grid grid-cols-5 gap-2">
          {actionTypes.map((action) => {
            const count = availableActions[action.key]
            return (
              <div key={action.key} className="flex flex-col items-center">
                <div className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center text-white font-bold text-lg mb-1`}>
                  {count}
                </div>
                <div className="text-xs text-center text-muted leading-tight">
                  {action.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
