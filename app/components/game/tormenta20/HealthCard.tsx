import Button from '~/components/ui/Button'

type HealthCardProps = {
  current: number
  max: number
  onChange?: (delta: number) => void
  onBleedingRoll?: () => void
  onConRoll?: () => void
}

const HealthCard = ({ current, max, onChange, onBleedingRoll, onConRoll }: HealthCardProps) => {
  const handleChange = (delta: number) => {
    onChange?.(delta)
  }

  const deathThreshold = Math.min(-10, -Math.floor(max / 2))
  const isDead = current <= deathThreshold
  const isBleeding = current < 1 && !isDead

  const percentage = Math.max(0, Math.min((current / max) * 100, 100))
  const hasExtra = current > max
  const extra = hasExtra ? current - max : 0
  const displayCurrent = hasExtra ? max : current

  return (
    <div>
      {/* Title and buttons row */}
      <div className="flex items-center gap-1 mb-0.5 min-w-0">
        <div className="text-xs md:text-sm font-semibold flex-shrink-0">PV</div>
        <div className="flex gap-0.5 flex-1 min-w-0 overflow-hidden">
          <Button onClick={() => handleChange(-10)} className="hidden lg:flex flex-1 min-w-0 py-0.5 lg:py-1.5 text-xs lg:text-sm">-10</Button>
          <Button onClick={() => handleChange(-5)} className="flex-1 min-w-0 py-0.5 md:py-1 lg:py-1.5 text-xs md:text-sm">-5</Button>
          <Button onClick={() => handleChange(-1)} className="flex-1 min-w-0 py-0.5 md:py-1 lg:py-1.5 text-xs md:text-sm">-1</Button>
          <Button onClick={() => handleChange(1)} className="flex-1 min-w-0 py-0.5 md:py-1 lg:py-1.5 text-xs md:text-sm">+1</Button>
          <Button onClick={() => handleChange(5)} className="flex-1 min-w-0 py-0.5 md:py-1 lg:py-1.5 text-xs md:text-sm">+5</Button>
          <Button onClick={() => handleChange(10)} className="hidden lg:flex flex-1 min-w-0 py-0.5 lg:py-1.5 text-xs lg:text-sm">+10</Button>
        </div>
      </div>

      {/* Value box with progress bar background */}
      <div className="relative border border-stroke rounded-lg overflow-hidden bg-progress-bg">
        {/* Progress bar background */}
        <div
          className="absolute inset-0 bg-progress-fill transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />

        {/* Value */}
        <div className="relative p-1 text-center">
          {isDead ? (
            <div className="text-lg font-bold text-red-600">MORTO</div>
          ) : isBleeding ? (
            <div className="flex items-center justify-between gap-1">
              <Button onClick={onBleedingRoll} className="px-1 py-0.5 text-[10px] bg-red-600 text-white">
                Sangrar
              </Button>
              <div className="text-sm font-bold text-red-600">
                {current - deathThreshold} para morrer
              </div>
              <Button onClick={onConRoll} className="px-1 py-0.5 text-[10px]">
                CON
              </Button>
            </div>
          ) : (
            <div className="text-lg font-bold">
              {hasExtra ? (
                <>
                  {displayCurrent} / {max} <span className="text-green-500">+{extra}</span>
                </>
              ) : (
                <>{current} / {max}</>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HealthCard
