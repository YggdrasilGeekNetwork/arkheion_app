import { useCallback, useMemo } from 'react'
import { useFetcher } from '@remix-run/react'
import { useWizard } from '~/contexts/WizardContext'
import Stepper from '~/components/ui/Stepper'
import WizardNavigation from './WizardNavigation'
import BasicInfoStep from './steps/BasicInfoStep'
import RaceStep from './steps/RaceStep'
import ClassStep from './steps/ClassStep'
import AttributesStep from './steps/AttributesStep'
import SkillsStep from './steps/SkillsStep'
import AbilitiesStep from './steps/AbilitiesStep'
import EquipmentStep from './steps/EquipmentStep'
import { STEP_LABELS, type WizardStep } from '~/types/wizard'

type CharacterCreationWizardProps = {
  isSubmitting?: boolean
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
  } = useWizard()

  const steps = useMemo(() => [
    { id: 'basic-info' as const, label: STEP_LABELS['basic-info'] },
    { id: 'race' as const, label: STEP_LABELS['race'] },
    { id: 'class' as const, label: STEP_LABELS['class'] },
    { id: 'attributes' as const, label: STEP_LABELS['attributes'] },
    { id: 'skills' as const, label: STEP_LABELS['skills'] },
    { id: 'abilities' as const, label: STEP_LABELS['abilities'] },
    { id: 'equipment' as const, label: STEP_LABELS['equipment'] },
  ], [])

  // Calculate pending choices counts for each step
  const pendingChoicesCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    steps.forEach(step => {
      const unresolvedChoices = getChoicesForStep(step.id).filter(c => !c.isResolved)
      if (unresolvedChoices.length > 0) {
        counts[step.id] = unresolvedChoices.length
      }
    })
    return counts
  }, [steps, getChoicesForStep, state.pendingChoices])

  const handleNext = useCallback(() => {
    if (isLastStep()) {
      // Submit the form
      const formData = new FormData()
      formData.append('wizardData', JSON.stringify(state.data))
      fetcher.submit(formData, { method: 'post' })
    } else {
      nextStep()
    }
  }, [isLastStep, nextStep, state.data, fetcher])

  const handleBack = useCallback(() => {
    previousStep()
  }, [previousStep])

  const currentErrors = state.errors[state.currentStep] || []
  const submitting = isSubmitting || fetcher.state === 'submitting'

  // Render the current step component
  const renderStep = () => {
    switch (state.currentStep) {
      case 'basic-info':
        return <BasicInfoStep />
      case 'race':
        return <RaceStep />
      case 'class':
        return <ClassStep />
      case 'attributes':
        return <AttributesStep />
      case 'skills':
        return <SkillsStep />
      case 'abilities':
        return <AbilitiesStep />
      case 'equipment':
        return <EquipmentStep />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <Stepper
        steps={steps}
        currentStep={state.currentStep}
        completedSteps={state.completedSteps}
        pendingChoicesCounts={pendingChoicesCounts}
        allowNavigation={true}
      />

      {/* Step content */}
      <div className="bg-card border border-stroke rounded-lg p-4 md:p-6 min-h-[400px]">
        {renderStep()}
      </div>

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
