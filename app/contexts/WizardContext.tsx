import { createContext, useContext, useReducer, useCallback, useMemo, type ReactNode } from 'react'
import { wizardReducer, type WizardAction } from '~/reducers/wizardReducer'
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
  OriginData,
  WizardLoaderData,
  WIZARD_STEPS,
  initialWizardState,
} from '~/types/wizard'

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
  if (!state.data.race) {
    errors.push('Selecione uma raça')
  }
  // Check if all race choices are resolved
  const unresolvedRaceChoices = state.pendingChoices.filter(
    c => c.sourceStep === 'race' && !c.isResolved
  )
  if (unresolvedRaceChoices.length > 0) {
    errors.push(`Resolva todas as escolhas de raça (${unresolvedRaceChoices.length} pendentes)`)
  }
  return errors
}

function validateClass(state: WizardState): string[] {
  const errors: string[] = []
  if (state.data.classes.length === 0) {
    errors.push('Selecione pelo menos uma classe')
  }
  // Check if all class choices are resolved
  const unresolvedClassChoices = state.pendingChoices.filter(
    c => c.sourceStep === 'class' && !c.isResolved
  )
  if (unresolvedClassChoices.length > 0) {
    errors.push(`Resolva todas as escolhas de classe (${unresolvedClassChoices.length} pendentes)`)
  }
  return errors
}

function validateAttributes(state: WizardState): string[] {
  const errors: string[] = []
  const { attributes, attributeMethod } = state.data

  if (attributeMethod === 'point-buy') {
    const pointCost = calculatePointBuyCost(attributes)
    if (pointCost > 27) {
      errors.push(`Você usou ${pointCost} pontos, mas só tem 27 disponíveis`)
    }
  }

  // Check all attributes are within valid range
  const attrValues = Object.values(attributes)
  if (attrValues.some(v => v < 8 || v > 20)) {
    errors.push('Atributos devem estar entre 8 e 20')
  }

  return errors
}

function validateSkills(state: WizardState): string[] {
  const errors: string[] = []
  // Check if all skill choices are resolved
  const unresolvedSkillChoices = state.pendingChoices.filter(
    c => c.sourceStep === 'skills' && !c.isResolved
  )
  if (unresolvedSkillChoices.length > 0) {
    errors.push(`Resolva todas as escolhas de perícias (${unresolvedSkillChoices.length} pendentes)`)
  }
  return errors
}

function validateAbilities(state: WizardState): string[] {
  const errors: string[] = []
  // Check if all ability choices are resolved
  const unresolvedAbilityChoices = state.pendingChoices.filter(
    c => c.sourceStep === 'abilities' && !c.isResolved
  )
  if (unresolvedAbilityChoices.length > 0) {
    errors.push(`Resolva todas as escolhas de habilidades (${unresolvedAbilityChoices.length} pendentes)`)
  }
  return errors
}

function validateEquipment(state: WizardState): string[] {
  const errors: string[] = []
  // Check if all equipment choices are resolved
  const unresolvedEquipmentChoices = state.pendingChoices.filter(
    c => c.sourceStep === 'equipment' && !c.isResolved
  )
  if (unresolvedEquipmentChoices.length > 0) {
    errors.push(`Resolva todas as escolhas de equipamento (${unresolvedEquipmentChoices.length} pendentes)`)
  }
  return errors
}

// Point buy cost calculation
function calculatePointBuyCost(attributes: AttributeValues): number {
  const costTable: Record<number, number> = {
    8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
  }

  return Object.values(attributes).reduce((total, value) => {
    // Values above 15 cost extra
    if (value > 15) {
      return total + 9 + (value - 15) * 2
    }
    return total + (costTable[value] || 0)
  }, 0)
}

// Context type
type WizardContextType = {
  state: WizardState
  dispatch: React.Dispatch<WizardAction>
  loaderData: WizardLoaderData | null

  // Navigation helpers
  goToStep: (step: WizardStep) => void
  nextStep: () => boolean
  previousStep: () => void
  canGoNext: () => boolean
  canGoPrevious: () => boolean
  isLastStep: () => boolean
  isFirstStep: () => boolean

  // Validation
  validateCurrentStep: () => string[]
  validateStep: (step: WizardStep) => string[]

  // Choice helpers
  getChoicesForStep: (step: WizardStep) => PendingChoice[]
  hasUnresolvedChoices: (step: WizardStep) => boolean
  resolveChoice: (choiceId: string, selectedOptions: string[]) => void

  // Data update helpers
  selectRace: (race: RaceSelection | null, raceData?: RaceData) => void
  addClass: (classData: ClassData, level?: number) => void
  removeClass: (classId: string) => void

  // Computed values
  getPointBuyRemaining: () => number
  getTotalLevel: () => number
}

const WizardContext = createContext<WizardContextType | null>(null)

type WizardProviderProps = {
  children: ReactNode
  loaderData?: WizardLoaderData
}

export function WizardProvider({ children, loaderData }: WizardProviderProps) {
  const [state, dispatch] = useReducer(wizardReducer, {
    currentStep: 'basic-info',
    completedSteps: [],
    isSubmitting: false,
    errors: {
      'basic-info': [],
      'race': [],
      'class': [],
      'attributes': [],
      'skills': [],
      'abilities': [],
      'equipment': [],
    },
    pendingChoices: [],
    data: {
      name: '',
      imageUrl: '',
      deity: null,
      origin: null,
      race: null,
      classes: [],
      attributeMethod: 'point-buy',
      attributes: { FOR: 10, DES: 10, CON: 10, INT: 10, SAB: 10, CAR: 10 },
      trainedSkills: [],
      selectedAbilities: [],
      equipmentMethod: 'package',
      startingEquipment: { weapons: [], armor: [], items: [] },
      currencies: { tc: 0, tp: 0, to: 0 },
    },
    computed: {
      totalLevel: 0,
      attributeBonuses: [],
      skillBonuses: [],
      grantedAbilities: [],
      grantedProficiencies: [],
      availableSkillPoints: 0,
      usedSkillPoints: 0,
      maxHealth: 0,
      maxMana: 0,
    },
  })

  const STEPS: WizardStep[] = [
    'basic-info',
    'race',
    'class',
    'attributes',
    'skills',
    'abilities',
    'equipment',
  ]

  // Validation functions
  const validateStep = useCallback((step: WizardStep): string[] => {
    switch (step) {
      case 'basic-info':
        return validateBasicInfo(state)
      case 'race':
        return validateRace(state)
      case 'class':
        return validateClass(state)
      case 'attributes':
        return validateAttributes(state)
      case 'skills':
        return validateSkills(state)
      case 'abilities':
        return validateAbilities(state)
      case 'equipment':
        return validateEquipment(state)
      default:
        return []
    }
  }, [state])

  const validateCurrentStep = useCallback(() => {
    return validateStep(state.currentStep)
  }, [state.currentStep, validateStep])

  // Navigation helpers
  const goToStep = useCallback((step: WizardStep) => {
    dispatch({ type: 'SET_STEP', payload: step })
  }, [])

  const canGoNext = useCallback(() => {
    const errors = validateCurrentStep()
    return errors.length === 0
  }, [validateCurrentStep])

  const canGoPrevious = useCallback(() => {
    return STEPS.indexOf(state.currentStep) > 0
  }, [state.currentStep])

  const isLastStep = useCallback(() => {
    return state.currentStep === STEPS[STEPS.length - 1]
  }, [state.currentStep])

  const isFirstStep = useCallback(() => {
    return state.currentStep === STEPS[0]
  }, [state.currentStep])

  const nextStep = useCallback(() => {
    const errors = validateCurrentStep()
    if (errors.length > 0) {
      dispatch({ type: 'SET_ERRORS', payload: { step: state.currentStep, errors } })
      return false
    }
    dispatch({ type: 'CLEAR_ERRORS', payload: state.currentStep })
    dispatch({ type: 'NEXT_STEP' })
    return true
  }, [state.currentStep, validateCurrentStep])

  const previousStep = useCallback(() => {
    dispatch({ type: 'PREVIOUS_STEP' })
  }, [])

  // Choice helpers
  const getChoicesForStep = useCallback((step: WizardStep) => {
    return state.pendingChoices.filter(c => c.sourceStep === step)
  }, [state.pendingChoices])

  const hasUnresolvedChoices = useCallback((step: WizardStep) => {
    return state.pendingChoices.some(c => c.sourceStep === step && !c.isResolved)
  }, [state.pendingChoices])

  const resolveChoice = useCallback((choiceId: string, selectedOptions: string[]) => {
    dispatch({ type: 'RESOLVE_CHOICE', payload: { choiceId, selectedOptions } })
  }, [])

  // Data update helpers with choice generation
  const selectRace = useCallback((race: RaceSelection | null, raceData?: RaceData) => {
    // Remove old race choices
    if (state.data.race) {
      dispatch({ type: 'REMOVE_PENDING_CHOICES_BY_SOURCE', payload: state.data.race.name })
    }

    dispatch({ type: 'SELECT_RACE', payload: race })

    // Generate new choices from race data
    if (race && raceData && raceData.choices) {
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
      dispatch({ type: 'ADD_PENDING_CHOICES', payload: newChoices })
    }

    // Update computed attribute bonuses
    if (raceData && raceData.attributeBonuses) {
      dispatch({
        type: 'UPDATE_COMPUTED',
        payload: {
          attributeBonuses: raceData.attributeBonuses.map(b => ({
            ...b,
            source: race?.name || '',
          })),
        },
      })
    }
  }, [state.data.race])

  const addClass = useCallback((classData: ClassData, level: number = 1) => {
    const classSelection: ClassSelection = {
      id: classData.id,
      name: classData.name,
      level,
    }

    dispatch({ type: 'ADD_CLASS', payload: classSelection })

    // Generate skill choices from class
    if (classData.skillChoices) {
      const skillChoice: PendingChoice = {
        id: `${classData.id}-skills`,
        type: 'multiple',
        source: classData.name,
        sourceStep: 'skills',
        title: `Perícias de ${classData.name}`,
        description: `Escolha ${classData.skillChoices.count} perícias para treinar`,
        options: classData.skillChoices.options.map(skill => ({
          id: skill,
          name: skill,
        })),
        minSelections: classData.skillChoices.count,
        maxSelections: classData.skillChoices.count,
        selectedOptions: [],
        isResolved: false,
      }
      dispatch({ type: 'ADD_PENDING_CHOICES', payload: [skillChoice] })
    }

    // Generate class-specific choices
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
      dispatch({ type: 'ADD_PENDING_CHOICES', payload: newChoices })
    }

    // Update total level
    const newTotalLevel = state.data.classes.reduce((sum, c) => sum + c.level, 0) + level
    dispatch({
      type: 'UPDATE_COMPUTED',
      payload: { totalLevel: newTotalLevel },
    })
  }, [state.data.classes])

  const removeClass = useCallback((classId: string) => {
    const classToRemove = state.data.classes.find(c => c.id === classId)
    if (classToRemove) {
      dispatch({ type: 'REMOVE_PENDING_CHOICES_BY_SOURCE', payload: classToRemove.name })
      dispatch({ type: 'REMOVE_CLASS', payload: classId })

      // Update total level
      const newTotalLevel = state.data.classes
        .filter(c => c.id !== classId)
        .reduce((sum, c) => sum + c.level, 0)
      dispatch({
        type: 'UPDATE_COMPUTED',
        payload: { totalLevel: newTotalLevel },
      })
    }
  }, [state.data.classes])

  // Computed value helpers
  const getPointBuyRemaining = useCallback(() => {
    const used = calculatePointBuyCost(state.data.attributes)
    return 27 - used
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
