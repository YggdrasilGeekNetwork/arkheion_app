import Tooltip from '~/components/ui/Tooltip'
import type { Defense } from '~/types/character'

type DefenseCardProps = {
  defenses: Defense[]
}

const DefenseCard = ({ defenses }: DefenseCardProps) => {
  const defesa = defenses?.[0]
  if (!defesa) return null

  return (
    <Tooltip content={defesa.tooltip ?? ''} className="cursor-help">
      <div className="bg-card border border-stroke rounded-lg px-2 py-1 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-base font-semibold text-muted">Defesa</span>
          <span className="text-xs opacity-50">?</span>
        </div>
        <span className="text-lg font-bold">{defesa.value}</span>
      </div>
    </Tooltip>
  )
}

export default DefenseCard
