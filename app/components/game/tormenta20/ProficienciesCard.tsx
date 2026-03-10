import Card from '~/components/ui/Card'
import Tooltip from '~/components/ui/Tooltip'
import type { CharacterProficiency } from '~/types/character'

export type Proficiency = CharacterProficiency

type ProficienciesCardProps = {
  proficiencies: Proficiency[]
}

const ProficienciesCard = ({ proficiencies }: ProficienciesCardProps) => (
  <Card>
    <div className="text-sm md:text-base font-semibold mb-1">Proficiências</div>
    <div className="flex flex-wrap gap-x-3 gap-y-1">
      {proficiencies.map((prof, index) => (
        <Tooltip key={index} content={prof.tooltip ?? ''} className={prof.tooltip ? 'cursor-help' : 'pointer-events-none'}>
          <span className="text-sm text-muted">
            {prof.name}{prof.tooltip && <span className="opacity-50 text-xs ml-0.5">?</span>}
          </span>
        </Tooltip>
      ))}
    </div>
  </Card>
)

export default ProficienciesCard
