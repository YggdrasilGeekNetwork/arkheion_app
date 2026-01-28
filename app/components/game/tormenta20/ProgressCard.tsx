import Button from '~/components/ui/Button'

type ProgressCardProps = {
  title: string
  current: number
  max: number
  onChange?: (delta: number) => void
  onBleedingRoll?: () => void
  onConRoll?: () => void
}

const ProgressCard = ({ title, current, max, onChange, onBleedingRoll, onConRoll }: ProgressCardProps) => {
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
      <div className="flex items-center gap-1.5 mb-0.5">
        <div className="text-xs font-semibold">{title}</div>
        <div className="flex gap-0.5">
          <Button onClick={() => handleChange(-5)} className="px-1.5 py-0.5 text-xs">-5</Button>
          <Button onClick={() => handleChange(-1)} className="px-1.5 py-0.5 text-xs">-1</Button>
          <Button onClick={() => handleChange(1)} className="px-1.5 py-0.5 text-xs">+1</Button>
          <Button onClick={() => handleChange(5)} className="px-1.5 py-0.5 text-xs">+5</Button>
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
              <div className="text-sm font-bold">{current} / {max}</div>
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

export default ProgressCard