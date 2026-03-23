import { useState, useEffect, useMemo } from 'react'
import type { PendingChoice, ChoiceOption } from '~/types/wizard'

type ChoiceCardProps = {
  choice: PendingChoice
  onResolve: (choiceId: string, selectedOptions: string[]) => void
  ineligibleOptions?: Map<string, string>  // optionId → reason
}

export default function ChoiceCard({ choice, onResolve, ineligibleOptions }: ChoiceCardProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(choice.selectedOptions)
  const [modalSpell, setModalSpell] = useState<ChoiceOption | null>(null)

  useEffect(() => {
    setSelectedOptions(choice.selectedOptions)
  }, [choice.id, choice.selectedOptions.length])

  const handleOptionToggle = (optionId: string) => {
    let newSelection: string[]

    if (choice.type === 'single') {
      newSelection = [optionId]
    } else {
      if (selectedOptions.includes(optionId)) {
        newSelection = selectedOptions.filter(id => id !== optionId)
      } else {
        if (selectedOptions.length >= choice.maxSelections) {
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

  const isSpellChoice = choice.effectType === 'spell-grant'

  // Group spells by school for spell choices
  const schoolGroups = useMemo(() => {
    if (!isSpellChoice) return null
    const groups = new Map<string, { schoolName: string; options: ChoiceOption[] }>()
    for (const option of choice.options) {
      const key = option.school ?? 'outro'
      const label = option.schoolName ?? 'Outro'
      if (!groups.has(key)) groups.set(key, { schoolName: label, options: [] })
      groups.get(key)!.options.push(option)
    }
    return groups
  }, [isSpellChoice, choice.options])

  // Default all school groups to open
  const [openSchools, setOpenSchools] = useState<Set<string>>(() =>
    new Set(schoolGroups?.keys() ?? [])
  )
  useEffect(() => {
    setOpenSchools(new Set(schoolGroups?.keys() ?? []))
  }, [choice.id])

  const toggleSchool = (schoolId: string) => {
    setOpenSchools(prev => {
      const next = new Set(prev)
      if (next.has(schoolId)) next.delete(schoolId)
      else next.add(schoolId)
      return next
    })
  }

  return (
    <>
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
            <div className={`text-xs px-2 py-1 rounded flex-shrink-0 ${
              isResolved ? 'bg-accent text-card' : 'bg-card text-muted'
            }`}>
              {isResolved ? '✓' : selectionText}
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="p-3">
          {isSpellChoice && schoolGroups ? (
            <div className="space-y-1.5">
              {[...schoolGroups.entries()].map(([schoolId, { schoolName, options }]) => {
                const isOpen = openSchools.has(schoolId)
                const selectedInGroup = options.filter(o => selectedOptions.includes(o.id)).length
                return (
                  <div key={schoolId} className="border border-stroke rounded-lg overflow-hidden">
                    {/* School header */}
                    <button
                      type="button"
                      onClick={() => toggleSchool(schoolId)}
                      onMouseDown={e => e.preventDefault()}
                      className="w-full flex items-center justify-between px-3 py-2 bg-card-muted hover:bg-card transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          className={`w-3.5 h-3.5 text-muted transition-transform ${isOpen ? 'rotate-90' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-xs font-semibold">{schoolName}</span>
                        <span className="text-xs text-muted">({options.length})</span>
                      </div>
                      {selectedInGroup > 0 && (
                        <span className="text-xs text-accent font-medium">
                          {selectedInGroup} escolhida{selectedInGroup > 1 ? 's' : ''}
                        </span>
                      )}
                    </button>

                    {/* Spell grid */}
                    {isOpen && (
                      <div className="p-2 grid grid-cols-3 gap-1.5">
                        {options.map(option => {
                          const ineligibleReason = ineligibleOptions?.get(option.id)
                          return (
                            <SpellButton
                              key={option.id}
                              option={option}
                              isSelected={selectedOptions.includes(option.id)}
                              isSingle={choice.type === 'single'}
                              onClick={() => !ineligibleReason && handleOptionToggle(option.id)}
                              onOpenModal={() => setModalSpell(option)}
                              ineligible={!!ineligibleReason}
                              ineligibleReason={ineligibleReason}
                            />
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className={`grid gap-2 ${
              choice.options.length <= 3 ? 'grid-cols-1' : 'grid-cols-2'
            }`}>
              {choice.options.map(option => {
                const ineligibleReason = ineligibleOptions?.get(option.id)
                return (
                  <OptionButton
                    key={option.id}
                    option={option}
                    isSelected={selectedOptions.includes(option.id)}
                    isSingle={choice.type === 'single'}
                    onClick={() => !ineligibleReason && handleOptionToggle(option.id)}
                    ineligible={!!ineligibleReason}
                    ineligibleReason={ineligibleReason}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Spell detail modal */}
      {modalSpell && (
        <SpellDetailModal spell={modalSpell} onClose={() => setModalSpell(null)} />
      )}
    </>
  )
}

// ── Spell detail modal ─────────────────────────────────────────────────────

function SpellDetailModal({ spell, onClose }: { spell: ChoiceOption; onClose: () => void }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-stroke rounded-xl shadow-2xl max-w-md w-full p-5 space-y-3"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold">{spell.name}</h3>
            {spell.schoolName && (
              <span className="text-xs text-accent/80 bg-accent/10 border border-accent/20 px-2 py-0.5 rounded mt-1 inline-block">
                {spell.schoolName}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 text-muted hover:text-foreground transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Description */}
        {spell.description ? (
          <p className="text-sm text-muted leading-relaxed">{spell.description}</p>
        ) : (
          <p className="text-sm text-muted italic">Sem descrição disponível.</p>
        )}
      </div>
    </div>
  )
}

// ── Spell button (compact, used inside school groups) ──────────────────────

type SpellButtonProps = {
  option: ChoiceOption
  isSelected: boolean
  isSingle: boolean
  onClick: () => void
  onOpenModal: () => void
  ineligible?: boolean
  ineligibleReason?: string
}

function SpellButton({ option, isSelected, isSingle, onClick, onOpenModal, ineligible, ineligibleReason }: SpellButtonProps) {
  return (
    <div className={`flex rounded border overflow-hidden transition-all ${
      ineligible
        ? 'border-stroke opacity-40'
        : isSelected
        ? 'border-accent'
        : 'border-stroke hover:border-accent/50'
    }`}>
      {/* Select area */}
      <button
        type="button"
        onClick={onClick}
        disabled={ineligible}
        className={`flex-1 text-left px-2 py-1.5 transition-colors ${
          ineligible
            ? 'bg-card-muted cursor-not-allowed'
            : isSelected
            ? 'bg-accent/10 text-accent'
            : 'bg-card-muted hover:bg-card'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <div className={`flex-shrink-0 w-3 h-3 rounded-${isSingle ? 'full' : 'sm'} border-2 flex items-center justify-center ${
            isSelected ? 'border-accent bg-accent' : 'border-muted'
          }`}>
            {isSelected && (
              isSingle ? (
                <div className="w-1.5 h-1.5 rounded-full bg-card" />
              ) : (
                <svg className="w-2 h-2 text-card" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )
            )}
          </div>
          <span className="text-xs font-medium leading-tight truncate">{option.name}</span>
        </div>
      </button>

      {/* Magnifying glass — opens detail modal */}
      <button
        type="button"
        onClick={e => { e.stopPropagation(); onOpenModal() }}
        className={`flex-shrink-0 px-1.5 border-l transition-colors ${
          isSelected
            ? 'border-accent/30 bg-accent/5 text-accent/70 hover:text-accent'
            : 'border-stroke bg-card text-muted hover:text-foreground'
        }`}
        title="Ver detalhes"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
      </button>
    </div>
  )
}

// ── Standard option button ─────────────────────────────────────────────────

type OptionButtonProps = {
  option: ChoiceOption
  isSelected: boolean
  isSingle: boolean
  onClick: () => void
  ineligible?: boolean
  ineligibleReason?: string
}

function OptionButton({ option, isSelected, isSingle, onClick, ineligible, ineligibleReason }: OptionButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        disabled={ineligible}
        className={`w-full text-left p-2 rounded border transition-all ${
          ineligible
            ? 'border-stroke bg-card-muted opacity-40 cursor-not-allowed'
            : isSelected
            ? 'border-accent bg-accent/10 text-accent'
            : 'border-stroke bg-card-muted hover:border-accent/50'
        }`}
      >
        <div className="flex items-center gap-2">
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

          {option.description && (
            <div className="flex-shrink-0 text-muted">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
        </div>
      </button>

      {showTooltip && (ineligibleReason || option.description) && (
        <div className="absolute z-20 bottom-full left-0 right-0 mb-2 p-2 bg-card border border-stroke rounded shadow-lg">
          {ineligibleReason && (
            <p className="text-xs text-red-400 font-medium mb-1">{ineligibleReason}</p>
          )}
          {option.description && (
            <p className="text-xs text-muted">{option.description}</p>
          )}
        </div>
      )}
    </div>
  )
}
