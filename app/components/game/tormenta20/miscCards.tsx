import type { Character } from '~/types/character'
import { updateSensesVisibility } from '~/utils/api'
import Tooltip from '~/components/ui/Tooltip'
import SensesCard from './SensesCard'
import ProficienciesCard from './ProficienciesCard'
import DefenseCard from './DefenseCard'
import InitiativeCard from './InitiativeCard'
import SpellDCCard from './SpellDCCard'
import type { MiscCardDef } from './MiscGrid'

export function buildMiscCards(
  character: Character,
  onSwitchToCombat: () => void,
  onRollInitiative: (result: number) => void,
  gap: number | string = 6,
): MiscCardDef[] {
  const cards: MiscCardDef[] = []

  cards.push({
    key: 'senses',
    element: (
      <SensesCard
        senses={character.senses}
        onSensesVisibilityChange={hidden => updateSensesVisibility(character.id, hidden)}
      />
    ),
  })

  if (character.proficiencies.length > 0) {
    cards.push({
      key: 'proficiencies',
      element: <ProficienciesCard proficiencies={character.proficiencies} />,
    })
  }

  cards.push({
    key: 'defense-initiative',
    element: (
      <div className="grid grid-cols-2 gap-1.5">
        <DefenseCard defenses={character.defenses} />
        <InitiativeCard
          initiativeModifier={character.skills.find(s => s.name === 'Iniciativa')?.modifier ?? 0}
          currentRoll={character.initiativeRoll}
          onSwitchToCombat={onSwitchToCombat}
          onRollInitiative={onRollInitiative}
        />
      </div>
    ),
  })

  cards.push({
    key: 'size-movement',
    element: (
      <div className="grid grid-cols-2 gap-1.5">
        <Tooltip content={character.sizeTooltip ?? ''} className={character.sizeTooltip ? 'cursor-help' : 'pointer-events-none'}>
          <div className="bg-card border border-stroke rounded-lg px-2 py-1 flex items-center h-full">
            <div className="flex items-center justify-between text-base w-full">
              <span className="flex items-center gap-0.5 font-semibold text-muted">
                Tamanho {character.sizeTooltip && <span className="opacity-50 text-xs">?</span>}
              </span>
              <span className="font-bold capitalize">{character.size ?? 'Médio'}</span>
            </div>
          </div>
        </Tooltip>
        <Tooltip content={character.movementTooltip ?? ''} className={character.movementTooltip ? 'cursor-help' : 'pointer-events-none'}>
          <div className="bg-card border border-stroke rounded-lg px-2 py-1 flex items-center h-full">
            <div className="flex items-center justify-between text-base w-full">
              <span className="flex items-center gap-0.5 font-semibold text-muted">
                Desloc. {character.movementTooltip && <span className="opacity-50 text-xs">?</span>}
              </span>
              <span className="font-bold whitespace-nowrap">
                {character.movement != null
                  ? `${character.movement}m / ${Math.floor(character.movement / 1.5)}q`
                  : '9m / 6q'}
              </span>
            </div>
          </div>
        </Tooltip>
      </div>
    ),
  })

  if (character.spellSaveDc != null) {
    cards.push({
      key: 'spelldc',
      element: (
        <SpellDCCard
          spellSaveDc={character.spellSaveDc}
          tooltip={character.spellDcTooltip}
          notes={character.spellDcNotes}
        />
      ),
    })
  }

  return cards
}
