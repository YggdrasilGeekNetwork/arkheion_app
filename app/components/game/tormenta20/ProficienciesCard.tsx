import Card from '~/components/ui/Card'
import type { CharacterProficiency } from '~/types/character'

export type Proficiency = CharacterProficiency

type ProficienciesCardProps = {
  proficiencies: Proficiency[]
}

const ProficienciesCard = ({ proficiencies }: ProficienciesCardProps) => (
  <Card>
    <div className="text-sm md:text-base font-semibold mb-1 md:mb-1.5">Proficiências</div>

    <div className="grid grid-cols-2 gap-x-2 gap-y-1 md:gap-y-1.5">
      {proficiencies.map((prof, index) => (
        <div key={index} className="flex items-start text-sm md:text-base group relative">
          <span className="text-muted mr-1 shrink-0">•</span>
          <span className="text-muted truncate">
            {prof.name} {prof.tooltip && <span className="opacity-50">?</span>}
          </span>
          {prof.tooltip && (
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-card border border-stroke rounded-lg p-2 shadow-lg z-10 w-48">
              <div className="text-xs">{prof.tooltip}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  </Card>
)

export default ProficienciesCard
