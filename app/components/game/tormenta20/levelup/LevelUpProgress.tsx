import type { LevelUpStep } from '~/types/levelup'

type LevelUpProgressProps = {
  currentStep: LevelUpStep
  showAttributeStep: boolean
  showSkillsStep: boolean
}

type StepInfo = {
  key: LevelUpStep
  label: string
  icon: string
}

export default function LevelUpProgress({
  currentStep,
  showAttributeStep,
  showSkillsStep,
}: LevelUpProgressProps) {
  const allSteps: StepInfo[] = [
    { key: 'class', label: 'Classe', icon: '⚔️' },
    { key: 'attributes', label: 'Atributos', icon: '💪' },
    { key: 'abilities', label: 'Habilidades', icon: '✨' },
    { key: 'skills', label: 'Perícias', icon: '📚' },
    { key: 'review', label: 'Revisar', icon: '✅' },
  ]

  // Filter steps based on what's shown
  const visibleSteps = allSteps.filter(step => {
    if (step.key === 'attributes' && !showAttributeStep) return false
    if (step.key === 'skills' && !showSkillsStep) return false
    return true
  })

  const currentIndex = visibleSteps.findIndex(s => s.key === currentStep)

  return (
    <div className="flex items-center justify-between mb-6">
      {visibleSteps.map((step, index) => {
        const isActive = step.key === currentStep
        const isCompleted = index < currentIndex
        const isLast = index === visibleSteps.length - 1

        return (
          <div key={step.key} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
                  isActive
                    ? 'bg-accent text-card ring-2 ring-accent/30'
                    : isCompleted
                    ? 'bg-green-500 text-card'
                    : 'bg-card-muted text-muted border border-stroke'
                }`}
              >
                {isCompleted ? '✓' : step.icon}
              </div>
              <span
                className={`text-[10px] mt-1 ${
                  isActive ? 'text-accent font-semibold' : 'text-muted'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {!isLast && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  isCompleted ? 'bg-green-500' : 'bg-stroke'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
