import type {
  WizardState,
  WizardStep,
  PendingChoice,
  RaceSelection,
  ClassSelection,
  AttributeMethod,
  EquipmentMethod,
  AttributeValues,
  EquipmentSelection,
} from '~/types/wizard'
import { WIZARD_STEPS } from '~/types/wizard'

// Action types
export type WizardAction =
  // Navigation
  | { type: 'SET_STEP'; payload: WizardStep }
  | { type: 'NEXT_STEP' }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'COMPLETE_STEP'; payload: WizardStep }

  // Basic Info
  | { type: 'UPDATE_NAME'; payload: string }
  | { type: 'UPDATE_IMAGE_URL'; payload: string }
  | { type: 'SELECT_ORIGIN'; payload: { id: string; name: string } | null }

  // Deity
  | { type: 'SELECT_DEITY'; payload: { id: string; name: string } | null }
  | { type: 'TOGGLE_POWER'; payload: string }
  | { type: 'SET_SELECTED_POWERS'; payload: string[] }

  // Race
  | { type: 'SELECT_RACE'; payload: RaceSelection | null }
  | { type: 'SELECT_SUBRACE'; payload: { id: string; name: string } | null }

  // Class
  | { type: 'ADD_CLASS'; payload: ClassSelection }
  | { type: 'REMOVE_CLASS'; payload: string }
  | { type: 'UPDATE_CLASS_LEVEL'; payload: { classId: string; level: number } }
  | { type: 'SELECT_ARCHETYPE'; payload: { classId: string; archetype: { id: string; name: string } | null } }

  // Attributes
  | { type: 'SET_ATTRIBUTE_METHOD'; payload: AttributeMethod }
  | { type: 'SET_ATTRIBUTES'; payload: AttributeValues }
  | { type: 'SET_SINGLE_ATTRIBUTE'; payload: { attribute: keyof AttributeValues; value: number } }

  // Skills
  | { type: 'TOGGLE_SKILL'; payload: string }
  | { type: 'SET_TRAINED_SKILLS'; payload: string[] }

  // Abilities
  | { type: 'TOGGLE_ABILITY'; payload: string }
  | { type: 'SET_SELECTED_ABILITIES'; payload: string[] }

  // Equipment
  | { type: 'SET_EQUIPMENT_METHOD'; payload: EquipmentMethod }
  | { type: 'SET_STARTING_EQUIPMENT'; payload: EquipmentSelection }
  | { type: 'SET_CURRENCIES'; payload: { tc: number; tp: number; to: number } }

  // Choice System
  | { type: 'ADD_PENDING_CHOICES'; payload: PendingChoice[] }
  | { type: 'REMOVE_PENDING_CHOICES_BY_SOURCE'; payload: string }
  | { type: 'RESOLVE_CHOICE'; payload: { choiceId: string; selectedOptions: string[] } }
  | { type: 'CLEAR_CHOICE'; payload: string }

  // Errors
  | { type: 'SET_ERRORS'; payload: { step: WizardStep; errors: string[] } }
  | { type: 'CLEAR_ERRORS'; payload: WizardStep }

  // Computed
  | { type: 'UPDATE_COMPUTED'; payload: Partial<WizardState['computed']> }

  // Submission
  | { type: 'SET_SUBMITTING'; payload: boolean }

  // Reset
  | { type: 'RESET_WIZARD' }

// Helper function to get next step
function getNextStep(currentStep: WizardStep): WizardStep | null {
  const currentIndex = WIZARD_STEPS.indexOf(currentStep)
  if (currentIndex < WIZARD_STEPS.length - 1) {
    return WIZARD_STEPS[currentIndex + 1]
  }
  return null
}

// Helper function to get previous step
function getPreviousStep(currentStep: WizardStep): WizardStep | null {
  const currentIndex = WIZARD_STEPS.indexOf(currentStep)
  if (currentIndex > 0) {
    return WIZARD_STEPS[currentIndex - 1]
  }
  return null
}

// Reducer
export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    // Navigation
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload,
      }

    case 'NEXT_STEP': {
      const nextStep = getNextStep(state.currentStep)
      if (nextStep) {
        const completedSteps = state.completedSteps.includes(state.currentStep)
          ? state.completedSteps
          : [...state.completedSteps, state.currentStep]
        return {
          ...state,
          currentStep: nextStep,
          completedSteps,
        }
      }
      return state
    }

    case 'PREVIOUS_STEP': {
      const prevStep = getPreviousStep(state.currentStep)
      if (prevStep) {
        return {
          ...state,
          currentStep: prevStep,
        }
      }
      return state
    }

    case 'COMPLETE_STEP':
      if (!state.completedSteps.includes(action.payload)) {
        return {
          ...state,
          completedSteps: [...state.completedSteps, action.payload],
        }
      }
      return state

    // Basic Info
    case 'UPDATE_NAME':
      return {
        ...state,
        data: {
          ...state.data,
          name: action.payload,
        },
      }

    case 'UPDATE_IMAGE_URL':
      return {
        ...state,
        data: {
          ...state.data,
          imageUrl: action.payload,
        },
      }

    case 'SELECT_DEITY':
      return {
        ...state,
        data: {
          ...state.data,
          deity: action.payload,
          selectedPowers: [], // Clear powers when changing deity
        },
      }

    case 'TOGGLE_POWER': {
      const hasPower = state.data.selectedPowers.includes(action.payload)
      return {
        ...state,
        data: {
          ...state.data,
          selectedPowers: hasPower
            ? state.data.selectedPowers.filter(p => p !== action.payload)
            : [...state.data.selectedPowers, action.payload],
        },
      }
    }

    case 'SET_SELECTED_POWERS':
      return {
        ...state,
        data: {
          ...state.data,
          selectedPowers: action.payload,
        },
      }

    case 'SELECT_ORIGIN':
      return {
        ...state,
        data: {
          ...state.data,
          origin: action.payload,
        },
      }

    // Race
    case 'SELECT_RACE':
      return {
        ...state,
        data: {
          ...state.data,
          race: action.payload,
        },
      }

    case 'SELECT_SUBRACE':
      if (state.data.race) {
        return {
          ...state,
          data: {
            ...state.data,
            race: {
              ...state.data.race,
              subRace: action.payload || undefined,
            },
          },
        }
      }
      return state

    // Class
    case 'ADD_CLASS':
      return {
        ...state,
        data: {
          ...state.data,
          classes: [...state.data.classes, action.payload],
        },
      }

    case 'REMOVE_CLASS':
      return {
        ...state,
        data: {
          ...state.data,
          classes: state.data.classes.filter(c => c.id !== action.payload),
        },
      }

    case 'UPDATE_CLASS_LEVEL':
      return {
        ...state,
        data: {
          ...state.data,
          classes: state.data.classes.map(c =>
            c.id === action.payload.classId
              ? { ...c, level: action.payload.level }
              : c
          ),
        },
      }

    case 'SELECT_ARCHETYPE':
      return {
        ...state,
        data: {
          ...state.data,
          classes: state.data.classes.map(c =>
            c.id === action.payload.classId
              ? { ...c, archetype: action.payload.archetype || undefined }
              : c
          ),
        },
      }

    // Attributes
    case 'SET_ATTRIBUTE_METHOD':
      return {
        ...state,
        data: {
          ...state.data,
          attributeMethod: action.payload,
        },
      }

    case 'SET_ATTRIBUTES':
      return {
        ...state,
        data: {
          ...state.data,
          attributes: action.payload,
        },
      }

    case 'SET_SINGLE_ATTRIBUTE':
      return {
        ...state,
        data: {
          ...state.data,
          attributes: {
            ...state.data.attributes,
            [action.payload.attribute]: action.payload.value,
          },
        },
      }

    // Skills
    case 'TOGGLE_SKILL': {
      const isTraining = state.data.trainedSkills.includes(action.payload)
      return {
        ...state,
        data: {
          ...state.data,
          trainedSkills: isTraining
            ? state.data.trainedSkills.filter(s => s !== action.payload)
            : [...state.data.trainedSkills, action.payload],
        },
      }
    }

    case 'SET_TRAINED_SKILLS':
      return {
        ...state,
        data: {
          ...state.data,
          trainedSkills: action.payload,
        },
      }

    // Abilities
    case 'TOGGLE_ABILITY': {
      const hasAbility = state.data.selectedAbilities.includes(action.payload)
      return {
        ...state,
        data: {
          ...state.data,
          selectedAbilities: hasAbility
            ? state.data.selectedAbilities.filter(a => a !== action.payload)
            : [...state.data.selectedAbilities, action.payload],
        },
      }
    }

    case 'SET_SELECTED_ABILITIES':
      return {
        ...state,
        data: {
          ...state.data,
          selectedAbilities: action.payload,
        },
      }

    // Equipment
    case 'SET_EQUIPMENT_METHOD':
      return {
        ...state,
        data: {
          ...state.data,
          equipmentMethod: action.payload,
        },
      }

    case 'SET_STARTING_EQUIPMENT':
      return {
        ...state,
        data: {
          ...state.data,
          startingEquipment: action.payload,
        },
      }

    case 'SET_CURRENCIES':
      return {
        ...state,
        data: {
          ...state.data,
          currencies: action.payload,
        },
      }

    // Choice System
    case 'ADD_PENDING_CHOICES':
      return {
        ...state,
        pendingChoices: [...state.pendingChoices, ...action.payload],
      }

    case 'REMOVE_PENDING_CHOICES_BY_SOURCE':
      return {
        ...state,
        pendingChoices: state.pendingChoices.filter(c => c.source !== action.payload),
      }

    case 'RESOLVE_CHOICE': {
      const { choiceId, selectedOptions } = action.payload
      return {
        ...state,
        pendingChoices: state.pendingChoices.map(choice =>
          choice.id === choiceId
            ? {
                ...choice,
                selectedOptions,
                isResolved: selectedOptions.length >= choice.minSelections &&
                            selectedOptions.length <= choice.maxSelections,
              }
            : choice
        ),
      }
    }

    case 'CLEAR_CHOICE':
      return {
        ...state,
        pendingChoices: state.pendingChoices.map(choice =>
          choice.id === action.payload
            ? { ...choice, selectedOptions: [], isResolved: false }
            : choice
        ),
      }

    // Errors
    case 'SET_ERRORS':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.step]: action.payload.errors,
        },
      }

    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload]: [],
        },
      }

    // Computed
    case 'UPDATE_COMPUTED':
      return {
        ...state,
        computed: {
          ...state.computed,
          ...action.payload,
        },
      }

    // Submission
    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.payload,
      }

    // Reset
    case 'RESET_WIZARD':
      return {
        currentStep: 'basic-info',
        completedSteps: [],
        isSubmitting: false,
        errors: {
          'basic-info': [],
          'race': [],
          'class': [],
          'attributes': [],
          'deity': [],
          'skills': [],
          'abilities': [],
          'equipment': [],
        },
        pendingChoices: [],
        data: {
          name: '',
          imageUrl: '',
          origin: null,
          race: null,
          classes: [],
          attributeMethod: 'point-buy',
          attributes: { FOR: 0, DES: 0, CON: 0, INT: 0, SAB: 0, CAR: 0 },
          deity: null,
          selectedPowers: [],
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
      }

    default:
      return state
  }
}
