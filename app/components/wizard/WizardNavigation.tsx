type WizardNavigationProps = {
  onBack: () => void
  onNext: () => void
  canGoBack: boolean
  canGoNext: boolean
  isLastStep: boolean
  isSubmitting: boolean
  errors: string[]
}

export default function WizardNavigation({
  onBack,
  onNext,
  canGoBack,
  canGoNext,
  isLastStep,
  isSubmitting,
  errors,
}: WizardNavigationProps) {
  return (
    <div className="space-y-3">
      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-500">Por favor, corrija os seguintes erros:</p>
              <ul className="mt-1 text-sm text-red-400 list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack || isSubmitting}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
            canGoBack && !isSubmitting
              ? 'bg-card border border-stroke hover:border-accent text-text'
              : 'bg-card-muted text-muted cursor-not-allowed'
          }`}
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </span>
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={isSubmitting}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
            isSubmitting
              ? 'bg-accent/50 text-card cursor-wait'
              : 'bg-accent text-card hover:bg-accent/80'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Criando...
            </span>
          ) : isLastStep ? (
            <span className="flex items-center gap-2">
              Criar Personagem
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Próximo
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
