import type { PendingChoice, WizardStep } from '~/types/wizard'
import ChoiceCard from './ChoiceCard'

type ChoiceResolverProps = {
  choices: PendingChoice[]
  onResolve: (choiceId: string, selectedOptions: string[]) => void
  title?: string
  emptyMessage?: string
}

export default function ChoiceResolver({
  choices,
  onResolve,
  title,
  emptyMessage = 'Nenhuma escolha pendente',
}: ChoiceResolverProps) {
  if (choices.length === 0) {
    return null
  }

  // Group choices by source
  const choicesBySource = choices.reduce((acc, choice) => {
    if (!acc[choice.source]) {
      acc[choice.source] = []
    }
    acc[choice.source].push(choice)
    return acc
  }, {} as Record<string, PendingChoice[]>)

  const sources = Object.keys(choicesBySource)
  const unresolvedCount = choices.filter(c => !c.isResolved).length
  const totalCount = choices.length

  return (
    <div className="space-y-4">
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">{title}</h3>
          <span className={`text-xs px-2 py-1 rounded ${
            unresolvedCount === 0
              ? 'bg-accent/20 text-accent'
              : 'bg-yellow-500/20 text-yellow-600'
          }`}>
            {unresolvedCount === 0
              ? `${totalCount} resolvida${totalCount > 1 ? 's' : ''}`
              : `${unresolvedCount} pendente${unresolvedCount > 1 ? 's' : ''}`
            }
          </span>
        </div>
      )}

      {/* Choice cards grouped by source */}
      {sources.length === 1 ? (
        // Single source: show cards directly
        <div className="space-y-3">
          {choices.map(choice => (
            <ChoiceCard
              key={choice.id}
              choice={choice}
              onResolve={onResolve}
            />
          ))}
        </div>
      ) : (
        // Multiple sources: group with headers
        <div className="space-y-4">
          {sources.map(source => (
            <div key={source}>
              <h4 className="text-xs font-medium text-muted mb-2 uppercase tracking-wide">
                {source}
              </h4>
              <div className="space-y-3">
                {choicesBySource[source].map(choice => (
                  <ChoiceCard
                    key={choice.id}
                    choice={choice}
                    onResolve={onResolve}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Compact version for inline use in steps
type InlineChoiceResolverProps = {
  choices: PendingChoice[]
  onResolve: (choiceId: string, selectedOptions: string[]) => void
}

export function InlineChoiceResolver({ choices, onResolve }: InlineChoiceResolverProps) {
  if (choices.length === 0) {
    return null
  }

  const unresolvedCount = choices.filter(c => !c.isResolved).length

  return (
    <div className="bg-card-muted border border-stroke rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2 h-2 rounded-full ${
          unresolvedCount > 0 ? 'bg-yellow-500' : 'bg-accent'
        }`} />
        <span className="text-sm font-medium">
          {unresolvedCount > 0
            ? `${unresolvedCount} escolha${unresolvedCount > 1 ? 's' : ''} pendente${unresolvedCount > 1 ? 's' : ''}`
            : 'Todas as escolhas resolvidas'
          }
        </span>
      </div>

      <div className="space-y-3">
        {choices.map(choice => (
          <ChoiceCard
            key={choice.id}
            choice={choice}
            onResolve={onResolve}
          />
        ))}
      </div>
    </div>
  )
}
