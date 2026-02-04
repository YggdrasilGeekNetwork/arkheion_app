import type { Character, Sense, Proficiency, Currencies, ActiveEffect, EquippedItems, EquipmentItem } from '~/types/character'
import Rollable from '../Rollable'
import HealthCard from '../HealthCard'
import ManaCard from '../ManaCard'
import DefenseCard from '../DefenseCard'
import SkillsCard from '../SkillsCard'
import Tooltip from '~/components/ui/Tooltip'
import SpellDCCard from '../SpellDCCard'
import InitiativeCard from '../InitiativeCard'
import SensesCard from '../SensesCard'
import ProficienciesCard from '../ProficienciesCard'
import EquippedItemsSummaryCard from '../EquippedItemsSummaryCard'
import CurrencyCard from '../CurrencyCard'
import ActiveEffectsSection from '../ActiveEffectsSection'

type SummaryTabProps = {
  character: Character
  senses: Sense[]
  proficiencies: Proficiency[]
  onHealthChange: (delta: number) => void
  onManaChange: (delta: number) => void
  onSkillsChange: (newSkills: typeof character.skills) => void
  onBleedingRoll: () => Promise<void>
  onConRoll: () => void
  onRollInitiative: (result: number) => void
  onSwitchToCombat: () => void
  onSensesChange: (newSenses: Sense[]) => void
  onProficienciesChange: (newProficiencies: Proficiency[]) => void
  onCurrenciesChange: (newCurrencies: Currencies) => void
  onEquippedItemsChange: (newItems: EquippedItems) => void
  onBackpackChange: (newBackpack: (EquipmentItem | null)[]) => void
  onUseConsumable: (item: EquipmentItem, source: 'equipped' | 'backpack', slotKey: string) => void
  activeEffects: ActiveEffect[]
  onClearEffect: (effectId: string) => void
  onClearEffectsByDuration: (duration: string) => void
  onClearAllEffects: () => void
  onCombatAction: (description: string, actionCost: string, execute: () => void) => void
}

export default function SummaryTab({
  character,
  senses,
  proficiencies,
  onHealthChange,
  onManaChange,
  onSkillsChange,
  onBleedingRoll,
  onConRoll,
  onRollInitiative,
  onSwitchToCombat,
  onSensesChange,
  onProficienciesChange,
  onCurrenciesChange,
  onEquippedItemsChange,
  onBackpackChange,
  onUseConsumable,
  activeEffects,
  onClearEffect,
  onClearEffectsByDuration,
  onClearAllEffects,
  onCombatAction,
}: SummaryTabProps) {
  return (
    <>
      {/* Attributes Section */}
      <div className="grid grid-cols-6 gap-[0.5vw] mb-[1vh]">
        {character.attributes.map((attr) => (
          <div key={attr.label} className="flex flex-col items-center bg-card border border-stroke rounded-lg p-1">
            <div className="text-xs font-semibold text-muted">{attr.label}</div>
            <Rollable label={attr.label} modifier={attr.modifier}>
              <div className="text-base font-bold">{attr.modifier >= 0 ? '+' : ''}{attr.modifier}</div>
            </Rollable>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-[0.5vw] mb-[1vh]">
        <HealthCard
          current={character.health}
          max={character.maxHealth}
          onChange={onHealthChange}
          onBleedingRoll={onBleedingRoll}
          onConRoll={onConRoll}
        />

        <ManaCard
          current={character.mana}
          max={character.maxMana}
          onChange={onManaChange}
        />
      </div>

      {/* Separator */}
      <div className="h-px bg-stroke mb-[1vh]" />

      <div className="grid grid-cols-2 gap-[0.5vw] mb-[1vh]">
        <DefenseCard
          attributes={character.attributes}
          armor={2}
          shield={2}
          others={3}
          othersDetails={[
            { label: 'Anel de Proteção', value: 1 },
            { label: 'Abrigo', value: 2 },
          ]}
        />

        <SkillsCard
          skills={character.skills}
          attributes={character.attributes}
          classes={character.classes}
          onSkillsChange={onSkillsChange}
          mode="summary"
        />
      </div>

      {/* Separator */}
      <div className="h-px bg-stroke mb-[1vh]" />

      {/* Misc Info Section */}
      <div className="grid grid-cols-2 gap-[0.5vw] mb-[1vh]">
        <Tooltip content="Sem bônus ou penalidade por tamanho" className="cursor-help">
          <div className="bg-card border border-stroke rounded-lg p-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-muted">Tamanho <span className="opacity-50">?</span></span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold">Médio</span>
                <span>|</span>
                <span className="text-muted">+0/-0</span>
              </div>
            </div>
          </div>
        </Tooltip>

        <div className="bg-card border border-stroke rounded-lg p-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-muted">Deslocamento</span>
            <span className="font-bold">9m / 6q</span>
          </div>
        </div>

        <SpellDCCard
          attributes={character.attributes}
          hasSpells={true}
          proficiencyBonus={2}
        />

        <InitiativeCard
          attributes={character.attributes}
          currentRoll={character.initiativeRoll}
          onSwitchToCombat={onSwitchToCombat}
          onRollInitiative={onRollInitiative}
        />
      </div>

      {/* Separator */}
      <div className="h-px bg-stroke mb-[1vh]" />

      {/* Senses, Proficiencies Section */}
      <div className="grid grid-cols-2 gap-[0.5vw] mb-[1vh]">
        <SensesCard
          senses={senses}
          onSensesChange={onSensesChange}
        />

        <ProficienciesCard
          proficiencies={proficiencies}
          onProficienciesChange={onProficienciesChange}
        />
      </div>

      {/* Separator */}
      <div className="h-px bg-stroke mb-[1vh]" />

      {/* Equipment and Currency Section */}
      <div className="grid grid-cols-2 gap-[0.5vw] mb-[1vh]">
        <EquippedItemsSummaryCard
          character={character}
          onEquippedItemsChange={onEquippedItemsChange}
          onBackpackChange={onBackpackChange}
          onUseConsumable={onUseConsumable}
          onCombatAction={onCombatAction}
        />
        <CurrencyCard currencies={character.currencies} onCurrenciesChange={onCurrenciesChange} />
      </div>

      {/* Active Effects Section */}
      <ActiveEffectsSection
        character={character}
        activeEffects={activeEffects}
        onClearEffect={onClearEffect}
        onClearEffectsByDuration={onClearEffectsByDuration}
        onClearAllEffects={onClearAllEffects}
      />
    </>
  )
}
