type ProgressBarProps = {
  value: number
  max: number
  className?: string
}

const ProgressBar = ({ value, max, className = '' }: ProgressBarProps) => {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className={`h-3.5 bg-progress-bg rounded-lg overflow-hidden ${className}`}>
      <div
        className="h-full bg-progress-fill transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

export default ProgressBar