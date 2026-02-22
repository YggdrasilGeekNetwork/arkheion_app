import { createContext, useContext, useCallback, useMemo, type ReactNode } from 'react'
import { useAppDispatch, useAppSelector } from '~/store/hooks'
import { wizardActions } from '~/store/slices/wizardSlice'
import type { WizardAction } from '~/reducers/wizardReducer'
import type {
  WizardState,
  WizardStep,
  PendingChoice,
  RaceSelection,
  ClassSelection,
  AttributeValues,
  EquipmentSelection,
  RaceData,
  ClassData,
  WizardLoaderData,
} from '~/types/wizard'
import { WIZARD_STEPS } from '~/types/wizard'

// Helper functions for validation
function validateBasicInfo(state: WizardState): string[] {
  const errors: string[] = []
  if (!state.data.name.trim()) {
    errors.push('Nome é obrigatório')
  } else if (state.data.name.trim().length < 2) {
    errors.push('Nome deve ter pelo menos 2 caracteres')
  }
  return errors
}

function validateRace(state: WizardState): string[] {
  const errors: string[] = []
  if (!state.data.race) errors.push('Selecione uma raça')
  const unresolvedRaceChoices = state.pendingChoices.filter(c => c.sourceStep === 'race' && !c.isResolved)
  if (unresolvedRaceChoices.length > 0) {
    errors.push(`Resolva todas as escolhas de raça (${unresolvedRaceChoices.length} pendentes)`)
  }
  return errors
}

function validateClass(state: WizardState): string[] {
  const errors: string[] = []
  if (state.data.classes.length === 0) errors.push('Selecione pelo menos uma classe')
  const unresolvedClassChoices = state.pendingChoices.filter(c => c.sourceStep === 'class' && !c.isResolved)
  if (unresolvedClassChoices.length > 0) {
    errors.push(`Resolva todas as escolhas de classe (${unresolvedClassChoices.length} pendentes)`)
  }
  return errors
}

function calculatePointBuyCost(attributes: AttributeValues): number {
  const costTable: Record<number, number> = { [-2]: -2, [-1]: -1, 0: 0, 1: 1, 2: 2, 3: 4, 4: 7 }
  return Object.values(attributes).reduce((total, value) => {
    const clampedValue = Math.max(-2, Math.min(4, value))
    return total + (costTable[clampedValue] ?? 0)
  }, 0)
}

function validateAttributes(state: WizardState): string[] {
  const errors: string[] = []
  const { attributes, attributeMethod } = state.data
  if (attributeMethod === 'point-buy') {
    const pointCost = calculatePointBuyCost(attributes)
    if (pointCost > 10) errors.push(`Você usou ${pointCost} pontos, mas só tem 10 disponíveis`)
  }
  const attrValues = Object.values(attributes)
  if (attrValues.some(v => v < -2 || v > 4)) errors.push('Atributos devem estar entre -2 e 4')
  return errors
}

function validateSkills(state: WizardState): string[] {
  const unresolvedSkillChoices = state.pendingChoices.filter(c => c.sourceStep === 'skills' && !c.isResolved)
  return unresolvedSkillChoices.length > 0
    ? [`Resolva todas as escolhas de perícias (${unresolvedSkillChoices.length} pendentes)`]
    : []
}

function validateAbilities(state: WizardState): string[] {
  const unresolvedAbilityChoices = state.pendingChoices.filter(c => c.sourceStep === 'abilities' && !c.isResolved)
  return unresolvedAbilityChoices.length > 0
    ? [`Resolva todas as escolhas de habilidades (${unresolvedAbilityChoices.length} pendentes)`]
    : []
}

function validateEquipment(state: WizardState): string[] {
  const unresolvedEquipmentChoices = state.pendingChoices.filter(c => c.sourceStep === 'equipment' && !c.isResolved)
  return unresolvedEquipmentChoices.length > 0
    ? [`Resolva todas as escolhas de equipamento (${unresolvedEquipmentChoices.length} pendentes)`]
    : []
}

function validateDeity(state: WizardState, loaderData: WizardLoaderData | null): string[] {
  const errors: string[] = []
  const allClasses = loaderData?.classes || []
  const requiresDeityOrPantheon = state.data.classes.some(cls => {
    const classData = allClasses.find(c => c.id === cls.id)
    return classData?.abilities.some(
      ability =>
        ability.name.toLowerCase().includes('magia divina') ||
        ability.name.toLowerCase().includes('poder divino')
    )
  })
  if (requiresDeityOrPantheon && !state.data.deity) {
    errors.push('Sua classe requer que você escolha uma divindade ou seja devoto do Panteão')
  }
  return errors
}

type WizardContextType = {
  state: WizardState
  dispatch: (action: WizardAction) => void
  loaderData: WizardLoaderData | null
  goToStep: (step: WizardStep) => void
  nextStep: () => boolean
  previousStep: () => void
  canGoNext: () => boolean
  canGoPrevious: () => boolean
  isLastStep: () => boolean
  isFirstStep: () => boolean
  validateCurrentStep: () => string[]
  validateStep: (step: WizardStep) => string[]
  getChoicesForStep: (step: WizardStep) => PendingChoice[]
  hasUnresolvedChoices: (step: WizardStep) => boolean
  resolveChoice: (choiceId: string, selectedOptions: string[]) => void
  selectRace: (race: RaceSelection | null, raceData?: RaceData) => void
  addClass: (classData: ClassData, level?: number) => void
  removeClass: (classId: string) => void
  getPointBuyRemaining: () => number
  getTotalLevel: () => number
}

const WizardContext = createContext<WizardContextType | null>(null)

type WizardProviderProps = {
  children: ReactNode
  loaderData?: WizardLoaderData
}

export function WizardProvider({ children, loaderData }: WizardProviderProps) {
  const appDispatch = useAppDispatch()
  const state = useAppSelector(s => s.wizard)

  // Route WizardAction to Redux slice actions
  const dispatch = useCallback((action: WizardAction) => {
    switch (action.type) {
      case 'SET_STEP': appDispatch(wizardActions.setStep(action.payload)); break
      case 'NEXT_STEP': appDispatch(wizardActions.nextStep()); break
      case 'PREVIOUS_STEP': appDispatch(wizardActions.previousStep()); break
      case 'COMPLETE_STEP': appDispatch(wizardActions.completeStep(action.payload)); break
      case 'UPDATE_NAME': appDispatch(wizardActions.updateName(action.payload)); break
      case 'UPDATE_IMAGE_URL': appDispatch(wizardActions.updateImageUrl(action.payload)); break
      case 'SELECT_ORIGIN': appDispatch(wizardActions.selectOrigin(action.payload)); break
      case 'SELECT_DEITY': appDispatch(wizardActions.selectDeity(action.payload)); break
      case 'TOGGLE_POWER': appDispatch(wizardActions.togglePower(action.payload)); break
      case 'SET_SELECTED_POWERS': appDispatch(wizardActions.setSelectedPowers(action.payload)); break
      case 'SELECT_RACE': appDispatch(wizardActions.selectRace(action.payload)); break
      case 'SELECT_SUBRACE': appDispatch(wizardActions.selectSubrace(action.payload)); break
      case 'ADD_CLASS': appDispatch(wizardActions.addClass(action.payload)); break
      case 'REMOVE_CLASS': appDispatch(wizardActions.removeClass(action.payload)); break
      case 'UPDATE_CLASS_LEVEL': appDispatch(wizardActions.updateClassLevel(action.payload)); break
      case 'SELECT_ARCHETYPE': appDispatch(wizardActions.selectArchetype(action.payload)); break
      case 'SET_ATTRIBUTE_METHOD': appDispatch(wizardActions.setAttributeMethod(action.payload)); break
      case 'SET_ATTRIBUTES': appDispatch(wizardActions.setAttributes(action.payload)); break
      case 'SET_SINGLE_ATTRIBUTE': appDispatch(wizardActions.setSingleAttribute(action.payload)); break
      case 'TOGGLE_SKILL': appDispatch(wizardActions.toggleSkill(action.payload)); break
      case 'SET_TRAINED_SKILLS': appDispatch(wizardActions.setTrainedSkills(action.payload)); break
      case 'TOGGLE_ABILITY': appDispatch(wizardActions.toggleAbility(action.payload)); break
      case 'SET_SELECTED_ABILITIES': appDispatch(wizardActions.setSelectedAbilities(action.payload)); break
      case 'SET_EQUIPMENT_METHOD': appDispatch(wizardActions.setEquipmentMethod(action.payload)); break
      case 'SET_STARTING_EQUIPMENT': appDispatch(wizardActions.setStartingEquipment(action.payload)); break
      case 'SET_CURRENCIES': appDispatch(wizardActions.setCurrencies(action.payload)); break
      case 'ADD_PENDING_CHOICES': appDispatch(wizardActions.addPendingChoices(action.payload)); break
      case 'REMOVE_PENDING_CHOICES_BY_SOURCE': appDispatch(wizardActions.removePendingChoicesBySource(action.payload)); break
      case 'RESOLVE_CHOICE': appDispatch(wizardActions.resolveChoice(action.payload)); break
      case 'CLEAR_CHOICE': appDispatch(wizardActions.clearChoice(action.payload)); break
      case 'SET_ERRORS': appDispatch(wizardActions.setErrors(action.payload)); break
      case 'CLEAR_ERRORS': appDispatch(wizardActions.clearErrors(action.payload)); break
      case 'UPDATE_COMPUTED': appDispatch(wizardActions.updateComputed(action.payload)); break
      case 'SET_SUBMITTING': appDispatch(wizardActions.setSubmitting(action.payload)); break
      case 'RESET_WIZARD': appDispatch(wizardActions.resetWizard()); break
    }
  }, [appDispatch])

  const validateStep = useCallback((step: WizardStep): string[] => {
    switch (step) {
      case 'basic-info': return validateBasicInfo(state)
      case 'race': return validateRace(state)
      case 'class': return validateClass(state)
      case 'attributes': return validateAttributes(state)
      case 'deity': return validateDeity(state, loaderData || null)
      case 'skills': return validateSkills(state)
      case 'abilities': return validateAbilities(state)
      case 'equipment': return validateEquipment(state)
      default: return []
    }
  }, [state, loaderData])

  const validateCurrentStep = useCallback(() => {
    return validateStep(state.currentStep)
  }, [state.currentStep, validateStep])

  const goToStep = useCallback((step: WizardStep) => {
    appDispatch(wizardActions.setStep(step))
  }, [appDispatch])

  const canGoNext = useCallback(() => {
    return validateCurrentStep().length === 0
  }, [validateCurrentStep])

  const canGoPrevious = useCallback(() => {
    return WIZARD_STEPS.indexOf(state.currentStep) > 0
  }, [state.currentStep])

  const isLastStep = useCallback(() => {
    return state.currentStep === WIZARD_STEPS[WIZARD_STEPS.length - 1]
  }, [state.currentStep])

  const isFirstStep = useCallback(() => {
    return state.currentStep === WIZARD_STEPS[0]
  }, [state.currentStep])

  const nextStep = useCallback(() => {
    const errors = validateCurrentStep()
    if (errors.length > 0) {
      appDispatch(wizardActions.setErrors({ step: state.currentStep, errors }))
      return false
    }
    appDispatch(wizardActions.clearErrors(state.currentStep))
    appDispatch(wizardActions.nextStep())
    return true
  }, [state.currentStep, validateCurrentStep, appDispatch])

  const previousStep = useCallback(() => {
    appDispatch(wizardActions.previousStep())
  }, [appDispatch])

  const getChoicesForStep = useCallback((step: WizardStep) => {
    return state.pendingChoices.filter(c => c.sourceStep === step)
  }, [state.pendingChoices])

  const hasUnresolvedChoices = useCallback((step: WizardStep) => {
    return state.pendingChoices.some(c => c.sourceStep === step && !c.isResolved)
  }, [state.pendingChoices])

  const resolveChoice = useCallback((choiceId: string, selectedOptions: string[]) => {
    appDispatch(wizardActions.resolveChoice({ choiceId, selectedOptions }))
  }, [appDispatch])

  const selectRace = useCallback((race: RaceSelection | null, raceData?: RaceData) => {
    if (state.data.race) {
      appDispatch(wizardActions.removePendingChoicesBySource(state.data.race.name))
    }
    appDispatch(wizardActions.selectRace(race))

    if (race && raceData?.choices) {
      const newChoices: PendingChoice[] = raceData.choices.map(choice => ({
        id: `${race.id}-${choice.id}`,
        type: choice.type,
        source: race.name,
        sourceStep: choice.targetStep,
        title: choice.title,
        description: choice.description,
        options: choice.options,
        minSelections: choice.minSelections,
        maxSelections: choice.maxSelections,
        selectedOptions: [],
        isResolved: false,
      }))
      appDispatch(wizardActions.addPendingChoices(newChoices))
    }

    if (raceData?.attributeBonuses) {
      appDispatch(wizardActions.updateComputed({
        attributeBonuses: raceData.attributeBonuses.map(b => ({ ...b, source: race?.name || '' })),
      }))
    }
  }, [state.data.race, appDispatch])

  const addClass = useCallback((classData: ClassData, level: number = 1) => {
    const classSelection: ClassSelection = { id: classData.id, name: classData.name, level }
    appDispatch(wizardActions.addClass(classSelection))

    if (classData.skillChoices) {
      const skillChoice: PendingChoice = {
        id: `${classData.id}-skills`,
        type: 'multiple',
        source: classData.name,
        sourceStep: 'skills',
        title: `Perícias de ${classData.name}`,
        description: `Escolha ${classData.skillChoices.count} perícias para treinar`,
        options: classData.skillChoices.options.map(skill => ({ id: skill, name: skill })),
        minSelections: classData.skillChoices.count,
        maxSelections: classData.skillChoices.count,
        selectedOptions: [],
        isResolved: false,
      }
      appDispatch(wizardActions.addPendingChoices([skillChoice]))
    }

    if (classData.choices) {
      const newChoices: PendingChoice[] = classData.choices
        .filter(choice => !choice.level || choice.level <= level)
        .map(choice => ({
          id: `${classData.id}-${choice.id}`,
          type: choice.type,
          source: classData.name,
          sourceStep: choice.targetStep,
          title: choice.title,
          description: choice.description,
          options: choice.options,
          minSelections: choice.minSelections,
          maxSelections: choice.maxSelections,
          selectedOptions: [],
          isResolved: false,
        }))
      appDispatch(wizardActions.addPendingChoices(newChoices))
    }

    const newTotalLevel = state.data.classes.reduce((sum, c) => sum + c.level, 0) + level
    appDispatch(wizardActions.updateComputed({ totalLevel: newTotalLevel }))
  }, [state.data.classes, appDispatch])

  const removeClass = useCallback((classId: string) => {
    const classToRemove = state.data.classes.find(c => c.id === classId)
    if (classToRemove) {
      appDispatch(wizardActions.removePendingChoicesBySource(classToRemove.name))
      appDispatch(wizardActions.removeClass(classId))
      const newTotalLevel = state.data.classes
        .filter(c => c.id !== classId)
        .reduce((sum, c) => sum + c.level, 0)
      appDispatch(wizardActions.updateComputed({ totalLevel: newTotalLevel }))
    }
  }, [state.data.classes, appDispatch])

  const getPointBuyRemaining = useCallback(() => {
    return 10 - calculatePointBuyCost(state.data.attributes)
  }, [state.data.attributes])

  const getTotalLevel = useCallback(() => {
    return state.data.classes.reduce((sum, c) => sum + c.level, 0)
  }, [state.data.classes])

  const contextValue = useMemo(() => ({
    state,
    dispatch,
    loaderData: loaderData || null,
    goToStep,
    nextStep,
    previousStep,
    canGoNext,
    canGoPrevious,
    isLastStep,
    isFirstStep,
    validateCurrentStep,
    validateStep,
    getChoicesForStep,
    hasUnresolvedChoices,
    resolveChoice,
    selectRace,
    addClass,
    removeClass,
    getPointBuyRemaining,
    getTotalLevel,
  }), [
    state,
    loaderData,
    dispatch,
    goToStep,
    nextStep,
    previousStep,
    canGoNext,
    canGoPrevious,
    isLastStep,
    isFirstStep,
    validateCurrentStep,
    validateStep,
    getChoicesForStep,
    hasUnresolvedChoices,
    resolveChoice,
    selectRace,
    addClass,
    removeClass,
    getPointBuyRemaining,
    getTotalLevel,
  ])

  return (
    <WizardContext.Provider value={contextValue}>
      {children}
    </WizardContext.Provider>
  )
}

export function useWizard() {
  const context = useContext(WizardContext)
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider')
  }
  return context
}
