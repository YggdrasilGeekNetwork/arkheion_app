import { useCallback, useEffect, useMemo, useState } from 'react'
import { useFetcher } from '@remix-run/react'
import { useWizard } from '~/contexts/WizardContext'
import { useAppDispatch } from '~/store/hooks'
import { wizardActions } from '~/store/slices/wizardSlice'
import Stepper from '~/components/ui/Stepper'
import WizardNavigation from './WizardNavigation'
import BasicInfoStep from './steps/BasicInfoStep'
import RaceStep from './steps/RaceStep'
import ClassStep from './steps/ClassStep'
import OriginStep from './steps/OriginStep'
import AttributesStep from './steps/AttributesStep'
import DeityStep from './steps/DeityStep'
import SkillsStep from './steps/SkillsStep'
import AbilitiesStep from './steps/AbilitiesStep'
import EquipmentStep from './steps/EquipmentStep'
import { STEP_LABELS, type WizardStep } from '~/types/wizard'

type CharacterCreationWizardProps = {
  isSubmitting?: boolean
}

// Which steps require a prior step to be completed before navigating there directly
const STEP_PREREQUISITES: Partial<Record<WizardStep, { step: WizardStep; label: string }>> = {
  skills:    { step: 'class', label: 'escolha de classe' },
  abilities: { step: 'class', label: 'escolha de classe' },
}

export default function CharacterCreationWizard({ isSubmitting = false }: CharacterCreationWizardProps) {
  const fetcher = useFetcher()
  const {
    state,
    nextStep,
    previousStep,
    canGoPrevious,
    isLastStep,
    getChoicesForStep,
    goToStep,
    getPointBuyRemaining,
  } = useWizard()

  const appDispatch = useAppDispatch()
  const [navigationWarning, setNavigationWarning] = useState<string | null>(null)
  const [showRestoreModal, setShowRestoreModal] = useState(false)

  // On mount, check if there's in-progress wizard data from a previous session
  useEffect(() => {
    const hasProgress = state.data.name.trim() !== '' ||
      state.data.race !== null ||
      state.data.classes.length > 0 ||
      state.currentStep !== 'attributes'
    if (hasProgress) setShowRestoreModal(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const steps = useMemo(() => [
    { id: 'attributes' as const, label: STEP_LABELS['attributes'] },
    { id: 'race' as const, label: STEP_LABELS['race'] },
    { id: 'class' as const, label: STEP_LABELS['class'] },
    { id: 'origin' as const, label: STEP_LABELS['origin'] },
    { id: 'deity' as const, label: STEP_LABELS['deity'] },
    { id: 'skills' as const, label: STEP_LABELS['skills'] },
    { id: 'abilities' as const, label: STEP_LABELS['abilities'] },
    { id: 'equipment' as const, label: STEP_LABELS['equipment'] },
    { id: 'basic-info' as const, label: STEP_LABELS['basic-info'] },
  ], [])

  // Detect incomplete attributes step
  const isAttributesIncomplete = useMemo(() => {
    const { attributeMethod, attributes } = state.data
    if (attributeMethod === 'point-buy') {
      return getPointBuyRemaining() !== 0
    }
    if (attributeMethod === 'standard-array') {
      // Standard array [-1,0,1,1,2,3] — complete when sorted values match exactly
      const sorted = Object.values(attributes).slice().sort((a, b) => a - b)
      const expected = [-1, 0, 1, 1, 2, 3]
      return !sorted.every((v, i) => v === expected[i])
    }
    return false
  }, [state.data, getPointBuyRemaining])

  // Calculate pending choices counts for each step
  const pendingChoicesCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    steps.forEach(step => {
      const unresolvedChoices = getChoicesForStep(step.id).filter(c => !c.isResolved)
      if (unresolvedChoices.length > 0) {
        counts[step.id] = unresolvedChoices.length
      }
    })
    // Show attributes as incomplete if not fully allocated
    if (isAttributesIncomplete) {
      counts['attributes'] = (counts['attributes'] || 0) || 1
    }
    return counts
  }, [steps, getChoicesForStep, state.pendingChoices, state.currentStep, isAttributesIncomplete])

  const handleStepClick = useCallback((stepId: string) => {
    const prereq = STEP_PREREQUISITES[stepId as WizardStep]
    if (prereq) {
      const prereqMet = stepId === 'skills' || stepId === 'abilities'
        ? state.data.classes.length > 0
        : state.completedSteps.includes(prereq.step)
      if (!prereqMet) {
        setNavigationWarning(`Atenção: ${prereq.label} pendente`)
        setTimeout(() => setNavigationWarning(null), 3000)
        return
      }
    }
    goToStep(stepId as WizardStep)
    setNavigationWarning(null)
    scrollToTop()
  }, [goToStep, state.data.classes, state.completedSteps])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const handleNext = useCallback(() => {
    if (isLastStep()) {
      const formData = new FormData()
      formData.append('wizardData', JSON.stringify(state.data))
      formData.append('pendingChoices', JSON.stringify(state.pendingChoices))
      fetcher.submit(formData, { method: 'post' })
    } else {
      nextStep()
      scrollToTop()
    }
  }, [isLastStep, nextStep, state.data, fetcher])

  const handleBack = useCallback(() => {
    previousStep()
    scrollToTop()
  }, [previousStep])

  const currentErrors = state.errors[state.currentStep] || []
  const submitting = isSubmitting || fetcher.state === 'submitting'
  const submitError = (fetcher.data as { error?: string } | undefined)?.error

  const renderStep = () => {
    switch (state.currentStep) {
      case 'attributes':
        return <AttributesStep />
      case 'race':
        return <RaceStep />
      case 'class':
        return <ClassStep />
      case 'origin':
        return <OriginStep />
      case 'deity':
        return <DeityStep />
      case 'skills':
        return <SkillsStep />
      case 'abilities':
        return <AbilitiesStep />
      case 'equipment':
        return <EquipmentStep />
      case 'basic-info':
        return <BasicInfoStep />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Restore progress modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card border border-stroke rounded-xl shadow-xl p-6 max-w-sm w-full mx-4 space-y-4">
            <h2 className="text-lg font-bold">Progresso encontrado</h2>
            <p className="text-sm text-muted">
              Você tem uma criação de personagem em andamento. Deseja retomar de onde parou ou começar do zero?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  appDispatch(wizardActions.resetWizard())
                  setShowRestoreModal(false)
                }}
                className="px-4 py-2 text-sm rounded-lg border border-stroke hover:bg-card-muted transition-colors"
              >
                Começar do zero
              </button>
              <button
                type="button"
                onClick={() => setShowRestoreModal(false)}
                className="px-4 py-2 text-sm rounded-lg bg-accent text-card font-medium hover:bg-accent/90 transition-colors"
              >
                Retomar progresso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stepper */}
      <Stepper
        steps={steps}
        currentStep={state.currentStep}
        completedSteps={state.completedSteps}
        pendingChoicesCounts={pendingChoicesCounts}
        onStepClick={handleStepClick}
        allowNavigation={true}
      />

      {/* Navigation warning */}
      {navigationWarning && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-2 text-sm text-yellow-600 dark:text-yellow-400">
          {navigationWarning}
        </div>
      )}

      {/* Step content */}
      <div className="bg-card border border-stroke rounded-lg p-4 md:p-6 min-h-[400px]">
        {renderStep()}
      </div>

      {/* Submission error */}
      {submitError && (
        <div className="bg-red-600/10 border border-red-600/30 rounded-lg px-4 py-3 text-sm text-red-500">
          {submitError}
        </div>
      )}

      {/* Navigation */}
      <WizardNavigation
        onBack={handleBack}
        onNext={handleNext}
        canGoBack={canGoPrevious()}
        canGoNext={true}
        isLastStep={isLastStep()}
        isSubmitting={submitting}
        errors={currentErrors}
      />

      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="bg-card-muted border border-stroke rounded-lg p-4 text-xs">
          <summary className="cursor-pointer font-medium">Debug: Estado do Wizard</summary>
          <pre className="mt-2 overflow-auto max-h-64">
            {JSON.stringify({
              currentStep: state.currentStep,
              completedSteps: state.completedSteps,
              pendingChoices: state.pendingChoices.length,
              data: state.data,
            }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}
