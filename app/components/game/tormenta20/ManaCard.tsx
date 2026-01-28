import Button from '~/components/ui/Button'

type ManaCardProps = {
  current: number
  max: number
  onChange?: (delta: number) => void
}

const ManaCard = ({ current, max, onChange }: ManaCardProps) => {
  const handleChange = (delta: number) => {
    onChange?.(delta)
  }

  const percentage = Math.max(0, Math.min((current / max) * 100, 100))
  const hasExtra = current > max
  const extra = hasExtra ? current - max : 0
  const displayCurrent = hasExtra ? max : current

  return (
    <div>
      {/* Title and buttons row */}
      <div className="flex items-center gap-1.5 mb-0.5">
        <div className="text-xs font-semibold">PM</div>
        <div className="flex gap-0.5">
          <Button onClick={() => handleChange(-5)} className="flex-1 max-w-[35px] md:max-w-[50px] py-0.5 text-xs">-5</Button>
          <Button onClick={() => handleChange(-1)} className="flex-1 max-w-[35px] md:max-w-[50px] py-0.5 text-xs">-1</Button>
          <Button onClick={() => handleChange(1)} className="flex-1 max-w-[35px] md:max-w-[50px] py-0.5 text-xs">+1</Button>
          <Button onClick={() => handleChange(5)} className="flex-1 max-w-[35px] md:max-w-[50px] py-0.5 text-xs">+5</Button>
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
          <div className="text-lg font-bold">
            {hasExtra ? (
              <>
                {displayCurrent} / {max} <span className="text-green-500">+{extra}</span>
              </>
            ) : (
              <>{current} / {max}</>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManaCard
