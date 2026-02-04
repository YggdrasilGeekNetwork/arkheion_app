import { useState } from 'react'
import type { PendingChoice, ChoiceOption } from '~/types/wizard'

type ChoiceCardProps = {
  choice: PendingChoice
  onResolve: (choiceId: string, selectedOptions: string[]) => void
}

export default function ChoiceCard({ choice, onResolve }: ChoiceCardProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(choice.selectedOptions)

  const handleOptionToggle = (optionId: string) => {
    let newSelection: string[]

    if (choice.type === 'single') {
      // Single selection: replace current selection
      newSelection = [optionId]
    } else {
      // Multiple selection: toggle option
      if (selectedOptions.includes(optionId)) {
        newSelection = selectedOptions.filter(id => id !== optionId)
      } else {
        // Check if we've reached max selections
        if (selectedOptions.length >= choice.maxSelections) {
          // Replace the first selected option
          newSelection = [...selectedOptions.slice(1), optionId]
        } else {
          newSelection = [...selectedOptions, optionId]
        }
      }
    }

    setSelectedOptions(newSelection)
    onResolve(choice.id, newSelection)
  }

  const isResolved = selectedOptions.length >= choice.minSelections &&
                     selectedOptions.length <= choice.maxSelections

  const selectionText = choice.type === 'single'
    ? 'Selecione uma opção'
    : `${selectedOptions.length}/${choice.maxSelections} selecionado${choice.maxSelections > 1 ? 's' : ''}`

  return (
    <div className={`bg-card border rounded-lg overflow-hidden transition-colors ${
      isResolved ? 'border-accent' : 'border-stroke'
    }`}>
      {/* Header */}
      <div className="p-3 border-b border-stroke bg-card-muted">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{choice.title}</span>
              <span className="text-xs text-muted bg-card px-2 py-0.5 rounded">
                {choice.source}
              </span>
            </div>
            {choice.description && (
              <p className="text-xs text-muted mt-1">{choice.description}</p>
            )}
          </div>
          <div className={`text-xs px-2 py-1 rounded ${
            isResolved ? 'bg-accent text-card' : 'bg-card text-muted'
          }`}>
            {isResolved ? '✓' : selectionText}
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="p-3">
        <div className={`grid gap-2 ${
          choice.options.length <= 3 ? 'grid-cols-1' : 'grid-cols-2'
        }`}>
          {choice.options.map(option => (
            <OptionButton
              key={option.id}
              option={option}
              isSelected={selectedOptions.includes(option.id)}
              isSingle={choice.type === 'single'}
              onClick={() => handleOptionToggle(option.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

type OptionButtonProps = {
  option: ChoiceOption
  isSelected: boolean
  isSingle: boolean
  onClick: () => void
}

function OptionButton({ option, isSelected, isSingle, onClick }: OptionButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`w-full text-left p-2 rounded border transition-all ${
          isSelected
            ? 'border-accent bg-accent/10 text-accent'
            : 'border-stroke bg-card-muted hover:border-accent/50'
        }`}
      >
        <div className="flex items-center gap-2">
          {/* Radio/Checkbox indicator */}
          <div className={`flex-shrink-0 w-4 h-4 rounded-${isSingle ? 'full' : 'sm'} border-2 flex items-center justify-center ${
            isSelected ? 'border-accent bg-accent' : 'border-muted'
          }`}>
            {isSelected && (
              isSingle ? (
                <div className="w-2 h-2 rounded-full bg-card" />
              ) : (
                <svg className="w-3 h-3 text-card" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )
            )}
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium">{option.name}</span>
            {option.effects && (
              <div className="text-xs text-muted mt-0.5">
                {option.effects.attributeBonus && (
                  <span className="text-accent">
                    +{option.effects.attributeBonus.value} {option.effects.attributeBonus.attribute}
                  </span>
                )}
                {option.effects.skillBonus && (
                  <span className="text-accent">
                    +{option.effects.skillBonus.value} {option.effects.skillBonus.skill}
                  </span>
                )}
                {option.effects.ability && (
                  <span className="text-accent">Concede habilidade</span>
                )}
                {option.effects.proficiency && (
                  <span className="text-accent">Proficiência</span>
                )}
              </div>
            )}
          </div>

          {/* Info icon if there's a description */}
          {option.description && (
            <div className="flex-shrink-0 text-muted">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
        </div>
      </button>

      {/* Tooltip with description */}
      {showTooltip && option.description && (
        <div className="absolute z-20 bottom-full left-0 right-0 mb-2 p-2 bg-card border border-stroke rounded shadow-lg">
          <p className="text-xs text-muted">{option.description}</p>
        </div>
      )}
    </div>
  )
}
