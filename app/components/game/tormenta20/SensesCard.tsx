import Card from '~/components/ui/Card'
import type { CharacterSense } from '~/types/character'

export type Sense = CharacterSense

type SensesCardProps = {
  senses: Sense[]
}

const SensesCard = ({ senses }: SensesCardProps) => (
  <Card>
    <div className="text-sm md:text-base font-semibold mb-1 md:mb-1.5">Sentidos</div>

    <div className="grid grid-cols-2 gap-x-2 gap-y-1 md:gap-y-1.5">
      {senses.map((sense, index) => (
        <div key={index} className="flex justify-between text-sm md:text-base group relative">
          <span className="text-muted truncate">
            {sense.name} {sense.tooltip && <span className="opacity-50">?</span>}
          </span>
          <span className="font-bold ml-1 shrink-0">{sense.value}</span>
          {sense.tooltip && (
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-card border border-stroke rounded-lg p-2 shadow-lg z-10 w-48">
              <div className="text-xs">{sense.tooltip}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  </Card>
)

export default SensesCard
