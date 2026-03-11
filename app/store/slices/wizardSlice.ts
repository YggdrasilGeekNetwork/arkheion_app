import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
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

const INITIAL_WIZARD_STATE: WizardState = {
  currentStep: WIZARD_STEPS[0],
  completedSteps: [],
  isSubmitting: false,
  errors: {
    'attributes': [],
    'race': [],
    'class': [],
    'origin': [],
    'deity': [],
    'skills': [],
    'abilities': [],
    'equipment': [],
    'basic-info': [],
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

const wizardSlice = createSlice({
  name: 'wizard',
  initialState: INITIAL_WIZARD_STATE,
  reducers: {
    // Navigation
    setStep(state, action: PayloadAction<WizardStep>) {
      state.currentStep = action.payload
    },
    nextStep(state) {
      const currentIndex = WIZARD_STEPS.indexOf(state.currentStep)
      if (currentIndex < WIZARD_STEPS.length - 1) {
        if (!state.completedSteps.includes(state.currentStep)) {
          state.completedSteps.push(state.currentStep)
        }
        state.currentStep = WIZARD_STEPS[currentIndex + 1]
      }
    },
    previousStep(state) {
      const currentIndex = WIZARD_STEPS.indexOf(state.currentStep)
      if (currentIndex > 0) state.currentStep = WIZARD_STEPS[currentIndex - 1]
    },
    completeStep(state, action: PayloadAction<WizardStep>) {
      if (!state.completedSteps.includes(action.payload)) {
        state.completedSteps.push(action.payload)
      }
    },

    // Basic Info
    updateName(state, action: PayloadAction<string>) {
      state.data.name = action.payload
    },
    updateImageUrl(state, action: PayloadAction<string>) {
      state.data.imageUrl = action.payload
    },
    selectOrigin(state, action: PayloadAction<{ id: string; name: string } | null>) {
      state.data.origin = action.payload
    },

    // Deity
    selectDeity(state, action: PayloadAction<{ id: string; name: string } | null>) {
      state.data.deity = action.payload
      state.data.selectedPowers = []
    },
    togglePower(state, action: PayloadAction<string>) {
      const idx = state.data.selectedPowers.indexOf(action.payload)
      if (idx >= 0) {
        state.data.selectedPowers.splice(idx, 1)
      } else {
        state.data.selectedPowers.push(action.payload)
      }
    },
    setSelectedPowers(state, action: PayloadAction<string[]>) {
      state.data.selectedPowers = action.payload
    },

    // Race
    selectRace(state, action: PayloadAction<RaceSelection | null>) {
      state.data.race = action.payload
    },
    selectSubrace(state, action: PayloadAction<{ id: string; name: string } | null>) {
      if (state.data.race) {
        state.data.race.subRace = action.payload || undefined
      }
    },

    // Class
    addClass(state, action: PayloadAction<ClassSelection>) {
      state.data.classes.push(action.payload)
    },
    removeClass(state, action: PayloadAction<string>) {
      state.data.classes = state.data.classes.filter(c => c.id !== action.payload)
    },
    updateClassLevel(state, action: PayloadAction<{ classId: string; level: number }>) {
      const cls = state.data.classes.find(c => c.id === action.payload.classId)
      if (cls) cls.level = action.payload.level
    },
    selectArchetype(state, action: PayloadAction<{ classId: string; archetype: { id: string; name: string } | null }>) {
      const cls = state.data.classes.find(c => c.id === action.payload.classId)
      if (cls) cls.archetype = action.payload.archetype || undefined
    },

    // Attributes
    setAttributeMethod(state, action: PayloadAction<AttributeMethod>) {
      state.data.attributeMethod = action.payload
    },
    setAttributes(state, action: PayloadAction<AttributeValues>) {
      state.data.attributes = action.payload
    },
    setSingleAttribute(state, action: PayloadAction<{ attribute: keyof AttributeValues; value: number }>) {
      state.data.attributes[action.payload.attribute] = action.payload.value
    },

    // Skills
    toggleSkill(state, action: PayloadAction<string>) {
      const idx = state.data.trainedSkills.indexOf(action.payload)
      if (idx >= 0) {
        state.data.trainedSkills.splice(idx, 1)
      } else {
        state.data.trainedSkills.push(action.payload)
      }
    },
    setTrainedSkills(state, action: PayloadAction<string[]>) {
      state.data.trainedSkills = action.payload
    },

    // Abilities
    toggleAbility(state, action: PayloadAction<string>) {
      const idx = state.data.selectedAbilities.indexOf(action.payload)
      if (idx >= 0) {
        state.data.selectedAbilities.splice(idx, 1)
      } else {
        state.data.selectedAbilities.push(action.payload)
      }
    },
    setSelectedAbilities(state, action: PayloadAction<string[]>) {
      state.data.selectedAbilities = action.payload
    },

    // Equipment
    setEquipmentMethod(state, action: PayloadAction<EquipmentMethod>) {
      state.data.equipmentMethod = action.payload
    },
    setStartingEquipment(state, action: PayloadAction<EquipmentSelection>) {
      state.data.startingEquipment = action.payload
    },
    setCurrencies(state, action: PayloadAction<{ tc: number; tp: number; to: number }>) {
      state.data.currencies = action.payload
    },

    // Choice System
    addPendingChoices(state, action: PayloadAction<PendingChoice[]>) {
      state.pendingChoices.push(...action.payload)
    },
    removePendingChoicesBySource(state, action: PayloadAction<string>) {
      state.pendingChoices = state.pendingChoices.filter(c => c.source !== action.payload)
    },
    resolveChoice(state, action: PayloadAction<{ choiceId: string; selectedOptions: string[] }>) {
      const { choiceId, selectedOptions } = action.payload
      const choice = state.pendingChoices.find(c => c.id === choiceId)
      if (choice) {
        choice.selectedOptions = selectedOptions
        choice.isResolved =
          selectedOptions.length >= choice.minSelections &&
          selectedOptions.length <= choice.maxSelections
      }
    },
    clearChoice(state, action: PayloadAction<string>) {
      const choice = state.pendingChoices.find(c => c.id === action.payload)
      if (choice) {
        choice.selectedOptions = []
        choice.isResolved = false
      }
    },

    // Errors
    setErrors(state, action: PayloadAction<{ step: WizardStep; errors: string[] }>) {
      state.errors[action.payload.step] = action.payload.errors
    },
    clearErrors(state, action: PayloadAction<WizardStep>) {
      state.errors[action.payload] = []
    },

    // Computed
    updateComputed(state, action: PayloadAction<Partial<WizardState['computed']>>) {
      Object.assign(state.computed, action.payload)
    },

    // Submission
    setSubmitting(state, action: PayloadAction<boolean>) {
      state.isSubmitting = action.payload
    },

    // Reset
    resetWizard() {
      return INITIAL_WIZARD_STATE
    },
  },
})

export const wizardActions = wizardSlice.actions
export const wizardReducer = wizardSlice.reducer
