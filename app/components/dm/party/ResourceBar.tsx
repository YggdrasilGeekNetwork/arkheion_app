import { getHealthPercentage, getHealthColorClass, getManaColorClass } from '../utils/snapshotHelpers'

type ResourceBarProps = {
  current: number
  max: number
  type: 'health' | 'mana'
}

export default function ResourceBar({ current, max, type }: ResourceBarProps) {
  const percentage = getHealthPercentage(current, max)
  const colorClass = type === 'health' ? getHealthColorClass(current, max) : getManaColorClass()

  return (
    <div className="flex items-center gap-1 w-full min-w-[60px]">
      <div className="flex-1 h-3 bg-card-muted rounded-full overflow-hidden border border-stroke">
        <div
          className={`h-full ${colorClass} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-[10px] text-muted whitespace-nowrap">
        {current}/{max}
      </span>
    </div>
  )
}
