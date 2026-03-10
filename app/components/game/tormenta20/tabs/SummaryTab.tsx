import type { Character, Currencies, ActiveEffect, EquippedItems, EquipmentItem } from '~/types/character'
import MiscGrid from '../MiscGrid'
import { buildMiscCards } from '../miscCards'

const ATTR_ABBR: Record<string, string> = {
  forca: 'FOR', destreza: 'DES', constituicao: 'CON',
  inteligencia: 'INT', sabedoria: 'SAB', carisma: 'CAR',
}

const ATTR_TOOLTIP: Record<string, string> = {
  forca: 'Sua capacidade de esmagar um tomate com as próprias mãos.',
  destreza: 'Sua capacidade de arremessar um tomate com precisão ou desviar de um atirado em você.',
  constituicao: 'Sua capacidade de comer um tomate podre ou mofado sem passar mal.',
  inteligencia: 'Saber que um tomate é botanicamente classificado como uma fruta.',
  sabedoria: 'O bom senso de saber que um tomate não pertence a uma salada de frutas.',
  carisma: 'A habilidade de persuasão necessária para vender uma salada de frutas com tomate.',
}
import Rollable from '../Rollable'
import HealthCard from '../HealthCard'
import ManaCard from '../ManaCard'
import SkillsCard from '../SkillsCard'
import EquippedItemsSummaryCard from '../EquippedItemsSummaryCard'
import ActiveEffectsSection from '../ActiveEffectsSection'

type SummaryTabProps = {
  character: Character
  onHealthChange: (delta: number) => void
  onManaChange: (delta: number) => void
  onSkillsChange: (newSkills: Character['skills']) => void
  onBleedingRoll: () => Promise<void>
  onConRoll: () => void
  onRollInitiative: (result: number) => void
  onSwitchToCombat: () => void
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
  onHealthChange,
  onManaChange,
  onSkillsChange,
  onBleedingRoll,
  onConRoll,
  onRollInitiative,
  onSwitchToCombat,
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
          <div key={attr.label} title={ATTR_TOOLTIP[attr.label]} className="flex flex-col items-center bg-card border border-stroke rounded-lg p-1 cursor-help">
            <div className="text-xs font-semibold text-muted">{ATTR_ABBR[attr.label] ?? attr.label.toUpperCase()}</div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[0.5vw] mb-[1vh]">
        <SkillsCard
          skills={character.skills}
          attributes={character.attributes}
          classes={character.classes}
          onSkillsChange={onSkillsChange}
          mode="summary"
        />

        <ActiveEffectsSection
          character={character}
          activeEffects={activeEffects}
          onClearEffect={onClearEffect}
          onClearEffectsByDuration={onClearEffectsByDuration}
          onClearAllEffects={onClearAllEffects}
          alwaysShow={true}
        />
      </div>

      {/* Separator */}
      <div className="h-px bg-stroke mb-[1vh]" />

      {/* Senses/Proficiencies + Misc Info Section */}
      <MiscGrid
        cards={buildMiscCards(character, onSwitchToCombat, onRollInitiative)}
        minColWidth={260}
        gap={6}
        className="mb-[1vh]"
      />

      {/* Separator */}
      <div className="h-px bg-stroke mb-[1vh]" />

      {/* Equipment Section with inline currencies */}
      <div className="mb-[1vh]">
        <EquippedItemsSummaryCard
          character={character}
          onEquippedItemsChange={onEquippedItemsChange}
          onBackpackChange={onBackpackChange}
          onUseConsumable={onUseConsumable}
          onCombatAction={onCombatAction}
          currencies={character.currencies}
          onCurrenciesChange={onCurrenciesChange}
        />
      </div>
    </>
  )
}
