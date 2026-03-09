import Card from '~/components/ui/Card'
import type { Defense } from '~/types/character'

type DefenseCardProps = {
  defenses: Defense[]
}

const DefenseCard = ({ defenses }: DefenseCardProps) => {
  const defesa = defenses?.[0]
  if (!defesa) return null

  return (
    <Card>
      <div className="flex items-center justify-between mb-0.5 md:mb-1">
        <div className="text-sm md:text-base font-semibold">Defesa</div>
        <div className="text-lg md:text-xl font-bold">{defesa.value}</div>
      </div>
      <div className="text-[10px] md:text-xs text-muted leading-tight">{defesa.tooltip}</div>
    </Card>
  )
}

export default DefenseCard
