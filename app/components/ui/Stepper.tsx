type StepConfig = {
  id: string
  label: string
}

type StepperProps = {
  steps: StepConfig[]
  currentStep: string
  completedSteps: string[]
  onStepClick?: (stepId: string) => void
  allowNavigation?: boolean
  pendingChoicesCounts?: Record<string, number>
}

export default function Stepper({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  allowNavigation = false,
  pendingChoicesCounts = {},
}: StepperProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStep)

  const getStepStatus = (stepId: string, index: number): 'completed' | 'current' | 'upcoming' => {
    if (completedSteps.includes(stepId)) return 'completed'
    if (stepId === currentStep) return 'current'
    return 'upcoming'
  }

  const canNavigate = (stepId: string, index: number): boolean => {
    if (!allowNavigation) return false
    if (!onStepClick) return false
    // Can navigate to completed steps or the step right after the last completed one
    return completedSteps.includes(stepId) || index <= completedSteps.length
  }

  return (
    <div className="w-full">
      {/* Mobile: Compact stepper with current step info */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted">
            Passo {currentIndex + 1} de {steps.length}
          </span>
          <span className="text-sm font-medium">
            {steps[currentIndex]?.label}
          </span>
        </div>
        <div className="flex gap-1">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id, index)
            const pendingCount = pendingChoicesCounts[step.id] || 0

            return (
              <div
                key={step.id}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  status === 'completed'
                    ? 'bg-accent'
                    : status === 'current'
                    ? 'bg-accent'
                    : 'bg-card-muted'
                }`}
              />
            )
          })}
        </div>
      </div>

      {/* Desktop: Full stepper with labels */}
      <div className="hidden md:block">
        <div className="flex items-start justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id, index)
            const pendingCount = pendingChoicesCounts[step.id] || 0
            const isClickable = canNavigate(step.id, index)
            const isLast = index === steps.length - 1

            return (
              <div
                key={step.id}
                className={`flex flex-col items-center flex-1 ${!isLast ? 'relative' : ''}`}
              >
                {/* Connector line */}
                {!isLast && (
                  <div
                    className={`absolute top-4 left-1/2 w-full h-0.5 ${
                      completedSteps.includes(step.id) ? 'bg-accent' : 'bg-card-muted'
                    }`}
                    style={{ transform: 'translateX(50%)' }}
                  />
                )}

                {/* Step circle */}
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick?.(step.id)}
                  disabled={!isClickable}
                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    status === 'completed'
                      ? 'bg-accent text-card cursor-pointer hover:bg-accent/80'
                      : status === 'current'
                      ? 'bg-card border-2 border-accent text-accent'
                      : 'bg-card-muted text-muted'
                  } ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  {status === 'completed' ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}

                  {/* Pending choices badge */}
                  {pendingCount > 0 && status !== 'completed' && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center">
                      {pendingCount}
                    </span>
                  )}
                </button>

                {/* Step label */}
                <span
                  className={`mt-2 text-xs text-center ${
                    status === 'current' ? 'font-semibold text-accent' : 'text-muted'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
