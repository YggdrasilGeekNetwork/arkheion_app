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
  OriginData,
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
  selectOrigin: (originId: string | null, originData?: OriginData) => void
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
      case 'SET_ORIGIN_ITEM_CHOICES': appDispatch(wizardActions.setOriginItemChoices(action.payload)); break
      case 'SET_ORIGIN_ITEM_WEAPON_CHOICES': appDispatch(wizardActions.setOriginItemWeaponChoices(action.payload)); break
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

    const choice = state.pendingChoices.find(c => c.id === choiceId)
    if (!choice) return

    if (choice.effectType === 'attribute-bonus') {
      // Replace attribute bonuses from this choice source (preserve fixed racial bonuses)
      const sourceBonusTag = `${choice.source}-attr-bonus`
      const existingBonuses = state.computed.attributeBonuses.filter(b => b.source !== sourceBonusTag)
      const newBonuses = selectedOptions.map(attr => ({ attribute: attr, value: 1, source: sourceBonusTag }))
      appDispatch(wizardActions.updateComputed({ attributeBonuses: [...existingBonuses, ...newBonuses] }))
    }

    if (choice.effectType === 'skill-training') {
      // Merge trained skills from this choice with any already trained
      const sourceTag = choice.id
      const otherSkills = state.data.trainedSkills.filter(
        s => !state.pendingChoices.some(c => c.id === sourceTag && c.selectedOptions.includes(s))
      )
      appDispatch(wizardActions.setTrainedSkills([...otherSkills, ...selectedOptions]))
    }

    if (choice.effectType === 'skill-bonus') {
      const sourceTag = choice.id
      const bonusValue = choice.effectValue ?? 2
      const existing = state.computed.skillBonuses.filter(b => b.source !== sourceTag)
      const newBonuses = selectedOptions.map(skill => ({ skill, value: bonusValue, source: sourceTag }))
      appDispatch(wizardActions.updateComputed({ skillBonuses: [...existing, ...newBonuses] }))
    }

    if (choice.effectType === 'versatil-mode') {
      const subSource = `${choice.source}-versatil`
      appDispatch(wizardActions.removePendingChoicesBySource(subSource))

      const skillOptions = (loaderData?.skills || []).map(s => ({
        id: s.name,
        name: s.name,
        description: `Atributo: ${s.attribute}`,
      }))

      if (selectedOptions[0] === 'two-skills') {
        appDispatch(wizardActions.addPendingChoices([{
          id: `${choice.source}-versatil-skills`,
          type: 'multiple',
          source: subSource,
          sourceStep: 'skills',
          title: 'Perícias Versáteis',
          description: 'Escolha 2 perícias adicionais para treinar',
          options: skillOptions,
          minSelections: 2,
          maxSelections: 2,
          selectedOptions: [],
          isResolved: false,
        }]))
      } else if (selectedOptions[0] === 'skill-and-power') {
        const generalPowers = loaderData?.generalPowers || []
        const powerOptions = generalPowers.map(p => ({ id: p.id, name: p.name, description: p.description }))
        appDispatch(wizardActions.addPendingChoices([
          {
            id: `${choice.source}-versatil-skill`,
            type: 'multiple',
            source: subSource,
            sourceStep: 'skills',
            title: 'Perícia Versátil',
            description: 'Escolha 1 perícia adicional para treinar',
            options: skillOptions,
            minSelections: 1,
            maxSelections: 1,
            selectedOptions: [],
            isResolved: false,
          },
          {
            id: `${choice.source}-versatil-power`,
            type: 'multiple',
            source: subSource,
            sourceStep: 'abilities',
            title: 'Poder Geral (Versátil)',
            description: 'Escolha 1 poder geral',
            options: powerOptions,
            minSelections: 1,
            maxSelections: 1,
            selectedOptions: [],
            isResolved: false,
            availablePowers: generalPowers,
          },
        ]))
      }
    }

    if (choice.effectType === 'memoria-postuma-mode') {
      const subSource = `${choice.source}-memoria-postuma`
      appDispatch(wizardActions.removePendingChoicesBySource(subSource))

      const skillOptions = (loaderData?.skills || []).map(s => ({
        id: s.name,
        name: s.name,
        description: `Atributo: ${s.attribute}`,
      }))

      if (selectedOptions[0] === 'trained-skill') {
        appDispatch(wizardActions.addPendingChoices([{
          id: `${choice.source}-memoria-skill`,
          type: 'multiple',
          source: subSource,
          sourceStep: 'skills',
          title: 'Memória Póstuma: Perícia',
          description: 'Escolha 1 perícia para se tornar treinado (não precisa ser da sua classe)',
          options: skillOptions,
          minSelections: 1,
          maxSelections: 1,
          selectedOptions: [],
          isResolved: false,
        }]))
      } else if (selectedOptions[0] === 'general-power') {
        const generalPowers = loaderData?.generalPowers || []
        const powerOptions = generalPowers.map(p => ({ id: p.id, name: p.name, description: p.description }))
        appDispatch(wizardActions.addPendingChoices([{
          id: `${choice.source}-memoria-power`,
          type: 'multiple',
          source: subSource,
          sourceStep: 'abilities',
          title: 'Memória Póstuma: Poder Geral',
          description: 'Escolha 1 poder geral',
          options: powerOptions,
          minSelections: 1,
          maxSelections: 1,
          selectedOptions: [],
          isResolved: false,
          availablePowers: generalPowers,
        }]))
      } else if (selectedOptions[0] === 'racial-ability-other-race') {
        const otherRaceAbilities = (loaderData?.races || [])
          .filter(r => r.id !== 'osteon' && r.id !== 'humano')
          .flatMap(r => r.abilities.map(a => ({
            id: a.id,
            name: `${a.name} (${r.name})`,
            description: a.description,
          })))
        appDispatch(wizardActions.addPendingChoices([{
          id: `${choice.source}-memoria-racial`,
          type: 'multiple',
          source: subSource,
          sourceStep: 'abilities',
          title: 'Memória Póstuma: Habilidade Racial',
          description: 'Escolha 1 habilidade racial de outra raça humanoide',
          options: otherRaceAbilities,
          minSelections: 1,
          maxSelections: 1,
          selectedOptions: [],
          isResolved: false,
        }]))
      }
    }

    if (choice.effectType === 'deformidade-mode') {
      const subSource = `${choice.source}-deformidade`
      appDispatch(wizardActions.removePendingChoicesBySource(subSource))
      // Also clear previous skill bonuses from this deformidade
      const existingSkillBonuses = state.computed.skillBonuses.filter(
        b => !b.source.startsWith(`${choice.source}-deformidade`)
      )
      appDispatch(wizardActions.updateComputed({ skillBonuses: existingSkillBonuses }))

      const skillOptions = (loaderData?.skills || []).map(s => ({
        id: s.name,
        name: s.name,
        description: `Atributo: ${s.attribute}`,
      }))

      if (selectedOptions[0] === 'two-skill-bonuses') {
        appDispatch(wizardActions.addPendingChoices([{
          id: `${choice.source}-deformidade-skills`,
          type: 'multiple',
          source: subSource,
          sourceStep: 'skills',
          title: 'Deformidade: Bônus de Perícia',
          description: 'Escolha 2 perícias para receber +2 em cada uma',
          options: skillOptions,
          minSelections: 2,
          maxSelections: 2,
          selectedOptions: [],
          isResolved: false,
          effectType: 'skill-bonus',
          effectValue: 2,
        }]))
      } else if (selectedOptions[0] === 'skill-and-tormenta') {
        const tormentaPowers = loaderData?.tormentaPowers || []
        const tormentaOptions = tormentaPowers.map(p => ({ id: p.id, name: p.name, description: p.description }))
        appDispatch(wizardActions.addPendingChoices([
          {
            id: `${choice.source}-deformidade-skill`,
            type: 'multiple',
            source: subSource,
            sourceStep: 'skills',
            title: 'Deformidade: Bônus de Perícia',
            description: 'Escolha 1 perícia para receber +2',
            options: skillOptions,
            minSelections: 1,
            maxSelections: 1,
            selectedOptions: [],
            isResolved: false,
            effectType: 'skill-bonus',
            effectValue: 2,
          },
          {
            id: `${choice.source}-deformidade-tormenta`,
            type: 'multiple',
            source: subSource,
            sourceStep: 'abilities',
            title: 'Deformidade: Poder da Tormenta',
            description: 'Escolha 1 poder da Tormenta',
            options: tormentaOptions,
            minSelections: 1,
            maxSelections: 1,
            selectedOptions: [],
            isResolved: false,
            availablePowers: tormentaPowers,
          },
        ]))
      }
    }

    if (choice.effectType === 'caminho-do-arcanista') {
      const path = selectedOptions[0] // 'bruxo' | 'feiticeiro' | 'mago'

      // Remove ALL previously spawned dependsOn choices for this source (spells + linhagem)
      const toRemove = state.pendingChoices.filter(
        c => c.source === choice.source && c.dependsOn != null
      )
      toRemove.forEach(c => appDispatch(wizardActions.removePendingChoiceById(c.id)))

      // Find the class definition to pull spell options (source is classData.name)
      const classDef = loaderData?.classes.find(cls => cls.name === choice.source)
      const spellChoiceDef = classDef?.choices?.find(ch => ch.id === `magias-iniciais-${path}`)
      const linhagemDef = classDef?.choices?.find(ch => ch.id === 'linhagem-do-feiticeiro')

      const toAdd: PendingChoice[] = []

      if (spellChoiceDef) {
        toAdd.push({
          id: `${classDef!.id}-${spellChoiceDef.id}`,
          type: spellChoiceDef.type,
          source: choice.source,
          sourceStep: spellChoiceDef.targetStep,
          title: spellChoiceDef.title,
          description: spellChoiceDef.description,
          options: spellChoiceDef.options,
          minSelections: spellChoiceDef.minSelections,
          maxSelections: spellChoiceDef.maxSelections,
          selectedOptions: [],
          isResolved: false,
          effectType: spellChoiceDef.effectType,
          dependsOn: path,
        })
      }

      if (path === 'feiticeiro' && linhagemDef) {
        toAdd.push({
          id: `${classDef!.id}-${linhagemDef.id}`,
          type: linhagemDef.type,
          source: choice.source,
          sourceStep: linhagemDef.targetStep,
          title: linhagemDef.title,
          description: linhagemDef.description,
          options: linhagemDef.options,
          minSelections: linhagemDef.minSelections,
          maxSelections: linhagemDef.maxSelections,
          selectedOptions: [],
          isResolved: false,
          effectType: linhagemDef.effectType,
          dependsOn: 'feiticeiro',
        })
      }

      if (toAdd.length > 0) {
        appDispatch(wizardActions.addPendingChoices(toAdd))
      }
    }

    if (choice.effectType === 'linhagem-do-feiticeiro') {
      const linhagem = selectedOptions[0] // 'draconico' | 'feerica' | 'rubra'

      // Remove any previously spawned linhagem sub-choices for this source
      const subChoiceIds = ['linhagem-draconico-elemento', 'linhagem-feerica-magia', 'linhagem-rubra-poder']
      state.pendingChoices
        .filter(c => c.source === choice.source && subChoiceIds.some(sid => c.id.endsWith(sid)))
        .forEach(c => appDispatch(wizardActions.removePendingChoiceById(c.id)))

      const classDef = loaderData?.classes.find(cls => cls.name === choice.source)
      const subChoiceId = `linhagem-${linhagem}-${linhagem === 'draconico' ? 'elemento' : linhagem === 'feerica' ? 'magia' : 'poder'}`
      const subDef = classDef?.choices?.find(ch => ch.id === subChoiceId)

      if (subDef && classDef) {
        appDispatch(wizardActions.addPendingChoices([{
          id: `${classDef.id}-${subDef.id}`,
          type: subDef.type,
          source: choice.source,
          sourceStep: subDef.targetStep,
          title: subDef.title,
          description: subDef.description,
          options: subDef.options,
          minSelections: subDef.minSelections,
          maxSelections: subDef.maxSelections,
          selectedOptions: [],
          isResolved: false,
          effectType: subDef.effectType,
          dependsOn: linhagem,
        }]))
      }
    }

    if (choice.effectType === 'escola-de-magias') {
      const schools = selectedOptions // e.g. ['abjur', 'evoc', 'trans']

      // Remove any previously spawned dependsOn spell choice for this source
      state.pendingChoices
        .filter(c => c.source === choice.source && c.dependsOn != null)
        .forEach(c => appDispatch(wizardActions.removePendingChoiceById(c.id)))

      // Only spawn the spell choice once all required schools are selected
      if (schools.length < choice.minSelections) return

      const classDef = loaderData?.classes.find(cls => cls.name === choice.source)
      if (!classDef) return

      // Merge spell options from all selected schools, dedup by id, sort by name
      const seen = new Set<string>()
      const combinedOptions = schools
        .flatMap(school => classDef.choices?.find(ch => ch.id === `magias-iniciais-${school}`)?.options ?? [])
        .filter(opt => seen.has(opt.id) ? false : (seen.add(opt.id), true))
        .sort((a, b) => a.name.localeCompare(b.name, 'pt'))

      if (combinedOptions.length === 0) return

      // Use any per-school choice as a template for count/effectType
      const templateDef = classDef.choices?.find(ch => ch.id === `magias-iniciais-${schools[0]}`)
      if (!templateDef) return

      appDispatch(wizardActions.addPendingChoices([{
        id: `${classDef.id}-magias-iniciais`,
        type: templateDef.type,
        source: choice.source,
        sourceStep: templateDef.targetStep,
        title: 'Magias Iniciais',
        description: `Escolha ${templateDef.minSelections} magias de 1º círculo das escolas selecionadas`,
        options: combinedOptions,
        minSelections: templateDef.minSelections,
        maxSelections: templateDef.maxSelections,
        selectedOptions: [],
        isResolved: false,
        effectType: templateDef.effectType,
        dependsOn: schools.join('|'),
      }]))
    }

    if (choice.effectType === 'origem-mode') {
      const mode = selectedOptions[0] // 'two-skills' | 'two-powers' | 'skill-and-power'
      const subSource = `${choice.source}-origem-sub`

      // Remove any previously spawned sub-choices for this origin
      appDispatch(wizardActions.removePendingChoicesBySource(subSource))

      const skillOptions = (choice.availableSkills || []).map(s => ({ id: s.id, name: s.name }))
      const powerOptions = (choice.availablePowers || []).map(p => ({
        id: p.id, name: p.name, description: p.description,
      }))

      const toAdd: PendingChoice[] = []
      if (mode === 'two-skills') {
        toAdd.push({
          id: `${subSource}-skills`,
          type: 'multiple',
          source: subSource,
          sourceStep: 'origin',
          title: 'Escolha 2 Perícias da Origem',
          description: 'Escolha 2 perícias da lista de benefícios da origem',
          options: skillOptions,
          minSelections: 2,
          maxSelections: 2,
          selectedOptions: [],
          isResolved: false,
        })
      } else if (mode === 'two-powers') {
        toAdd.push({
          id: `${subSource}-powers`,
          type: 'multiple',
          source: subSource,
          sourceStep: 'origin',
          title: 'Escolha 2 Poderes da Origem',
          description: 'Escolha 2 poderes da lista de benefícios da origem',
          options: powerOptions,
          minSelections: 2,
          maxSelections: 2,
          selectedOptions: [],
          isResolved: false,
          availablePowers: choice.availablePowers,
        })
      } else if (mode === 'skill-and-power') {
        toAdd.push({
          id: `${subSource}-skill`,
          type: 'single',
          source: subSource,
          sourceStep: 'origin',
          title: 'Escolha 1 Perícia da Origem',
          description: 'Escolha 1 perícia da lista de benefícios da origem',
          options: skillOptions,
          minSelections: 1,
          maxSelections: 1,
          selectedOptions: [],
          isResolved: false,
        })
        toAdd.push({
          id: `${subSource}-power`,
          type: 'single',
          source: subSource,
          sourceStep: 'origin',
          title: 'Escolha 1 Poder da Origem',
          description: 'Escolha 1 poder da lista de benefícios da origem',
          options: powerOptions,
          minSelections: 1,
          maxSelections: 1,
          selectedOptions: [],
          isResolved: false,
          availablePowers: choice.availablePowers,
        })
      }
      if (toAdd.length > 0) {
        appDispatch(wizardActions.addPendingChoices(toAdd))
      }
    }
  }, [appDispatch, state.pendingChoices, state.computed.attributeBonuses, state.computed.skillBonuses, loaderData])

  const selectRace = useCallback((race: RaceSelection | null, raceData?: RaceData) => {
    if (state.data.race) {
      const prevName = state.data.race.name
      appDispatch(wizardActions.removePendingChoicesBySource(prevName))
      appDispatch(wizardActions.removePendingChoicesBySource(`${prevName}-versatil`))
      appDispatch(wizardActions.removePendingChoicesBySource(`${prevName}-deformidade`))
      appDispatch(wizardActions.removePendingChoicesBySource(`${prevName}-memoria-postuma`))
      appDispatch(wizardActions.removePendingChoicesBySource(`${prevName}-attr-bonus`))
      // Clear attribute bonuses from previous race
      appDispatch(wizardActions.updateComputed({ attributeBonuses: [] }))
    }
    appDispatch(wizardActions.selectRace(race))

    if (race && raceData?.choices) {
      const skillOptions = (loaderData?.skills || []).map(s => ({
        id: s.name,
        name: s.name,
        description: `Atributo: ${s.attribute}`,
      }))
      const newChoices: PendingChoice[] = raceData.choices.map(choice => ({
        id: `${race.id}-${choice.id}`,
        type: choice.type,
        source: race.name,
        sourceStep: choice.targetStep,
        title: choice.title,
        description: choice.description,
        // skill-training choices have options: [] from API; inject from loaderData
        options: choice.effectType === 'skill-training' && choice.options.length === 0
          ? skillOptions
          : choice.options,
        minSelections: choice.minSelections,
        maxSelections: choice.maxSelections,
        selectedOptions: [],
        isResolved: false,
        effectType: choice.effectType,
      }))
      appDispatch(wizardActions.addPendingChoices(newChoices))
    }

    if (raceData?.attributeBonuses && raceData.attributeBonuses.length > 0) {
      appDispatch(wizardActions.updateComputed({
        attributeBonuses: raceData.attributeBonuses.map(b => ({ ...b, source: race?.name || '' })),
      }))
    }
  }, [state.data.race, appDispatch, loaderData])

  const selectOrigin = useCallback((originId: string | null, originData?: OriginData) => {
    if (state.data.origin) {
      const prevSource = state.data.origin.name
      appDispatch(wizardActions.removePendingChoicesBySource(prevSource))
      appDispatch(wizardActions.removePendingChoicesBySource(`${prevSource}-origem-sub`))
    }

    appDispatch(wizardActions.selectOrigin(originId ? { id: originId, name: originData?.name || originId } : null))
    appDispatch(wizardActions.setOriginItemChoices({}))
    appDispatch(wizardActions.setOriginItemWeaponChoices({}))

    if (originId && originData?.choices) {
      const newChoices: PendingChoice[] = originData.choices.map(choice => ({
        id: `${originId}-${choice.id}`,
        type: choice.type,
        source: originData.name,
        sourceStep: choice.targetStep,
        title: choice.title,
        description: choice.description,
        options: choice.options,
        minSelections: choice.minSelections,
        maxSelections: choice.maxSelections,
        selectedOptions: [],
        isResolved: false,
        effectType: choice.effectType,
        availableSkills: choice.availableSkills,
        availablePowers: choice.availablePowers,
      }))
      appDispatch(wizardActions.addPendingChoices(newChoices))
    }
  }, [state.data.origin, appDispatch])

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
      // Choices with dependsOn are spawned dynamically when their dependency is resolved
      const newChoices: PendingChoice[] = classData.choices
        .filter(choice => (!choice.level || choice.level <= level) && !choice.dependsOn)
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
          effectType: choice.effectType,
          effectValue: choice.effectValue,
          dependsOn: choice.dependsOn,
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
    selectOrigin,
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
    selectOrigin,
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
