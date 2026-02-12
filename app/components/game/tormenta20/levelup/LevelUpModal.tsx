import { useState, useCallback } from 'react'
import Modal from '~/components/ui/Modal'
import type { Character, Ability } from '~/types/character'
import type { LevelUpStep, LevelUpData } from '~/types/levelup'
import {
  shouldIncreaseAttribute,
  CLASS_INFO,
  calculateHpGained,
  calculateMpGained,
  getModifierFromValue,
} from '~/types/levelup'
import { getTotalLevel } from '~/utils/tormenta20'
import LevelUpProgress from './LevelUpProgress'
import ClassStep from './steps/ClassStep'
import AttributeStep from './steps/AttributeStep'
import AbilitiesStep from './steps/AbilitiesStep'
import SkillsStep from './steps/SkillsStep'
import ReviewStep from './steps/ReviewStep'

type LevelUpModalProps = {
  isOpen: boolean
  onClose: () => void
  character: Character
  onConfirm: (data: LevelUpData) => Promise<void>
}

// Mock available abilities for testing (in real app, this would come from class data)
const getMockAbilitiesForLevel = (className: string, level: number): Ability[] => {
  // Return some mock abilities based on class and level
  if (level % 2 === 0) {
    return [
      {
        id: `${className}-${level}-1`,
        name: 'Ataque Extra',
        description: 'Você pode fazer um ataque adicional quando usa a ação Atacar.',
        type: 'passive',
        source: `${className} ${level}`,
      },
      {
        id: `${className}-${level}-2`,
        name: 'Golpe Brutal',
        description: 'Quando acerta um ataque crítico, adicione seu modificador de Força ao dano uma segunda vez.',
        type: 'passive',
        source: `${className} ${level}`,
      },
    ]
  }
  return [
    {
      id: `${className}-${level}-1`,
      name: 'Especialização em Combate',
      description: 'Escolha um tipo de arma. Você recebe +2 de dano com essa arma.',
      type: 'passive',
      source: `${className} ${level}`,
    },
  ]
}

export default function LevelUpModal({
  isOpen,
  onClose,
  character,
  onConfirm,
}: LevelUpModalProps) {
  // Current step
  const [currentStep, setCurrentStep] = useState<LevelUpStep>('class')

  // Step 1: Class
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [isNewClass, setIsNewClass] = useState(false)
  const [hpRoll, setHpRoll] = useState<number | null>(null)

  // Step 2: Attributes
  const [attributeChoice, setAttributeChoice] = useState<string | null>(null)

  // Step 3: Abilities
  const [selectedAbilities, setSelectedAbilities] = useState<Ability[]>([])

  // Step 4: Skills
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calculate derived values
  const currentTotalLevel = getTotalLevel(character.classes)
  const newTotalLevel = currentTotalLevel + 1
  const showAttributeStep = shouldIncreaseAttribute(newTotalLevel)

  const getSelectedClass = () => {
    if (!selectedClassId) return null
    if (isNewClass) {
      return { name: selectedClassId, level: 0 }
    }
    return character.classes.find(c => c.name === selectedClassId)
  }

  const getNewClassLevel = () => {
    const cls = getSelectedClass()
    return cls ? cls.level + 1 : 1
  }

  const getHpGained = () => {
    if (!hpRoll) return 0
    const conAttr = character.attributes.find(a => a.label === 'CON')
    return calculateHpGained(hpRoll, conAttr?.modifier ?? 0)
  }

  const getMpGained = () => {
    if (!selectedClassId) return 0
    const classInfo = CLASS_INFO[selectedClassId]
    if (!classInfo) return 0
    const mpAttr = character.attributes.find(a => a.label === classInfo.mpAttribute)
    return calculateMpGained(selectedClassId, mpAttr?.modifier ?? 0)
  }

  const getAvailableAbilities = (): Ability[] => {
    if (!selectedClassId) return []
    return getMockAbilitiesForLevel(selectedClassId, getNewClassLevel())
  }

  // For now, no skills step (simplified)
  const showSkillsStep = false
  const maxSkillsToSelect = 0

  // Step navigation
  const getNextStep = (): LevelUpStep | null => {
    switch (currentStep) {
      case 'class':
        return showAttributeStep ? 'attributes' : 'abilities'
      case 'attributes':
        return 'abilities'
      case 'abilities':
        return showSkillsStep ? 'skills' : 'review'
      case 'skills':
        return 'review'
      case 'review':
        return null
    }
  }

  const getPreviousStep = (): LevelUpStep | null => {
    switch (currentStep) {
      case 'class':
        return null
      case 'attributes':
        return 'class'
      case 'abilities':
        return showAttributeStep ? 'attributes' : 'class'
      case 'skills':
        return 'abilities'
      case 'review':
        return showSkillsStep ? 'skills' : 'abilities'
    }
  }

  const canGoNext = (): boolean => {
    switch (currentStep) {
      case 'class':
        return selectedClassId !== null && hpRoll !== null
      case 'attributes':
        return attributeChoice !== null
      case 'abilities':
        return true // Abilities are optional
      case 'skills':
        return selectedSkills.length === maxSkillsToSelect || maxSkillsToSelect === 0
      case 'review':
        return true
    }
  }

  const handleNext = () => {
    const next = getNextStep()
    if (next) {
      setCurrentStep(next)
    }
  }

  const handlePrevious = () => {
    const prev = getPreviousStep()
    if (prev) {
      setCurrentStep(prev)
    }
  }

  const handleConfirm = async () => {
    if (!selectedClassId || hpRoll === null) return

    setIsSubmitting(true)
    try {
      const selectedClass = getSelectedClass()
      const data: LevelUpData = {
        classId: selectedClassId,
        className: selectedClassId,
        previousLevel: selectedClass?.level ?? 0,
        newLevel: getNewClassLevel(),
        hpGained: getHpGained(),
        hpRoll,
        mpGained: getMpGained(),
        attributeIncrease: attributeChoice
          ? {
              attribute: attributeChoice,
              previousValue: character.attributes.find(a => a.label === attributeChoice)?.value ?? 10,
              newValue: (character.attributes.find(a => a.label === attributeChoice)?.value ?? 10) + 1,
              previousModifier: character.attributes.find(a => a.label === attributeChoice)?.modifier ?? 0,
              newModifier: getModifierFromValue(
                (character.attributes.find(a => a.label === attributeChoice)?.value ?? 10) + 1
              ),
            }
          : undefined,
        newAbilities: selectedAbilities,
        newSkills: selectedSkills,
      }

      await onConfirm(data)
      handleClose()
    } catch (error) {
      console.error('Failed to level up:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    // Reset state
    setCurrentStep('class')
    setSelectedClassId(null)
    setIsNewClass(false)
    setHpRoll(null)
    setAttributeChoice(null)
    setSelectedAbilities([])
    setSelectedSkills([])
    onClose()
  }

  const handleSelectClass = (classId: string | null, isNew: boolean) => {
    setSelectedClassId(classId)
    setIsNewClass(isNew)
    // Reset dependent state
    setSelectedAbilities([])
  }

  const handleToggleAbility = (ability: Ability) => {
    setSelectedAbilities(prev => {
      const exists = prev.some(a => a.id === ability.id)
      if (exists) {
        return prev.filter(a => a.id !== ability.id)
      }
      return [...prev, ability]
    })
  }

  const handleToggleSkill = (skillName: string) => {
    setSelectedSkills(prev => {
      if (prev.includes(skillName)) {
        return prev.filter(s => s !== skillName)
      }
      if (prev.length >= maxSkillsToSelect) {
        return prev
      }
      return [...prev, skillName]
    })
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'class':
        return (
          <ClassStep
            classes={character.classes}
            attributes={character.attributes}
            selectedClassId={selectedClassId}
            isNewClass={isNewClass}
            hpRoll={hpRoll}
            onSelectClass={handleSelectClass}
            onRollHp={setHpRoll}
          />
        )
      case 'attributes':
        return (
          <AttributeStep
            attributes={character.attributes}
            selectedAttribute={attributeChoice}
            newTotalLevel={newTotalLevel}
            onSelectAttribute={setAttributeChoice}
          />
        )
      case 'abilities':
        return (
          <AbilitiesStep
            availableAbilities={getAvailableAbilities()}
            selectedAbilities={selectedAbilities}
            className={selectedClassId ?? ''}
            newLevel={getNewClassLevel()}
            onToggleAbility={handleToggleAbility}
          />
        )
      case 'skills':
        return (
          <SkillsStep
            availableSkills={[]}
            selectedSkills={selectedSkills}
            currentSkills={character.skills}
            maxSelections={maxSkillsToSelect}
            onToggleSkill={handleToggleSkill}
          />
        )
      case 'review':
        return (
          <ReviewStep
            className={selectedClassId ?? ''}
            previousLevel={getSelectedClass()?.level ?? 0}
            newLevel={getNewClassLevel()}
            newTotalLevel={newTotalLevel}
            hpGained={getHpGained()}
            mpGained={getMpGained()}
            attributeIncrease={attributeChoice}
            attributes={character.attributes}
            selectedAbilities={selectedAbilities}
            selectedSkills={selectedSkills}
          />
        )
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Subir de Nível">
      <div className="min-h-[400px] flex flex-col">
        {/* Progress Indicator */}
        <LevelUpProgress
          currentStep={currentStep}
          showAttributeStep={showAttributeStep}
          showSkillsStep={showSkillsStep}
        />

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 mt-4 border-t border-stroke">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 'class'}
            className="px-4 py-2 border border-stroke rounded hover:bg-card-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Voltar
          </button>

          {currentStep === 'review' ? (
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="px-6 py-2 bg-accent text-card rounded hover:bg-accent-hover disabled:opacity-50 transition-colors font-semibold"
            >
              {isSubmitting ? 'Aplicando...' : 'Confirmar Level Up'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canGoNext()}
              className="px-4 py-2 bg-accent text-card rounded hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Próximo
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}
