import type { Character, Sense, Proficiency, CombatAction, WeaponAttack, EquippedItems, EquipmentItem, Currencies, ActiveEffect, Ability } from '~/types/character'

type NavItem = { id: string; label: string }
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
import ActiveEffectsSection from '../ActiveEffectsSection'
import BottomNavigation from '../BottomNavigation'
import AbilitiesTab from './AbilitiesTab'
import InventoryTab from './InventoryTab'
import OtherTab from './OtherTab'
import CombatTabDesktop from './CombatTabDesktop'

type DesktopViewProps = {
  character: Character
  senses: Sense[]
  proficiencies: Proficiency[]
  activeNavDesktop: string
  navItemsDesktop: NavItem[]
  weaponModalOpen: boolean
  choiceModalOpen: boolean
  pendingAction: CombatAction | null
  onHealthChange: (delta: number) => void
  onManaChange: (delta: number) => void
  onSkillsChange: (newSkills: typeof character.skills) => void
  onBleedingRoll: () => Promise<void>
  onConRoll: () => void
  onRollInitiative: (result: number) => void
  onToggleCombat: () => void
  onSwitchToCombat: () => void
  onSensesChange: (newSenses: Sense[]) => void
  onProficienciesChange: (newProficiencies: Proficiency[]) => void
  onEquippedItemsChange: (newItems: EquippedItems) => void
  onBackpackChange: (newBackpack: (EquipmentItem | null)[]) => void
  onCurrenciesChange: (newCurrencies: Currencies) => void
  onResistancesChange: (newResistances: typeof character.resistances) => void
  onNavChange: (nav: string) => void
  onStartTurn: () => void
  onUseAction: (action: CombatAction) => void
  onUseWeapon: (weapon: WeaponAttack) => void
  onUseAbility?: (ability: Ability) => void
  onRollDamage: (weapon: WeaponAttack) => void
  onReorderFavorites: (newWeapons: WeaponAttack[], newActions: CombatAction[], newAbilities?: Ability[]) => void
  onToggleFavoriteAction: (actionId: string) => void
  onToggleFavoriteAbility?: (abilityId: string) => void
  onToggleFavoriteSpell?: (spellId: string) => void
  onSetWeaponModalOpen: (open: boolean) => void
  onAddWeapon: (weapon: Omit<WeaponAttack, 'id'>) => void
  onUpdateWeapon: (weaponId: string, weaponData: Omit<WeaponAttack, 'id' | 'isFavorite'>) => Promise<void>
  onRemoveWeapon: (weaponId: string) => void
  onToggleFavoriteWeapon: (weaponId: string) => void
  onSetChoiceModalOpen: (open: boolean) => void
  onChoiceSelect: (choice: string) => void
  onUseConsumable: (item: EquipmentItem, source: 'equipped' | 'backpack', slotKey: string) => void
  activeEffects: ActiveEffect[]
  onClearEffect: (effectId: string) => void
  onClearEffectsByDuration: (duration: string) => void
  onClearAllEffects: () => void
  onCombatAction: (description: string, actionCost: string, execute: () => void) => void
  onAddActiveEffect?: (effect: {
    name: string
    description: string
    source: string
    type: 'active' | 'consumable'
    duration?: string
    consumeOnAttack?: boolean
  }) => void
}

export default function DesktopView({
  character,
  senses,
  proficiencies,
  activeNavDesktop,
  navItemsDesktop,
  weaponModalOpen,
  choiceModalOpen,
  pendingAction,
  onHealthChange,
  onManaChange,
  onSkillsChange,
  onBleedingRoll,
  onConRoll,
  onRollInitiative,
  onToggleCombat,
  onSwitchToCombat,
  onSensesChange,
  onProficienciesChange,
  onEquippedItemsChange,
  onBackpackChange,
  onCurrenciesChange,
  onResistancesChange,
  onNavChange,
  onStartTurn,
  onUseAction,
  onUseWeapon,
  onUseAbility,
  onRollDamage,
  onReorderFavorites,
  onToggleFavoriteAction,
  onToggleFavoriteAbility,
  onToggleFavoriteSpell,
  onSetWeaponModalOpen,
  onAddWeapon,
  onUpdateWeapon,
  onRemoveWeapon,
  onToggleFavoriteWeapon,
  onSetChoiceModalOpen,
  onChoiceSelect,
  onUseConsumable,
  activeEffects,
  onClearEffect,
  onClearEffectsByDuration,
  onClearAllEffects,
  onCombatAction,
  onAddActiveEffect,
}: DesktopViewProps) {
  return (
    <div className="hidden md:flex md:justify-center flex-1" style={{ height: '-webkit-fill-available' }}>
      <div className="flex w-full max-w-[96vw] px-[2vw]" style={{ height: '-webkit-fill-available' }}>
        {/* LEFT COLUMN: Always shows Summary */}
        <div className="flex-1 min-w-0 flex flex-col overflow-y-auto pr-2" style={{ height: '-webkit-fill-available' }}>
          {/* Attributes Section */}
          <div className="grid grid-cols-6 gap-1.5 mb-2">
            {character.attributes.map((attr) => (
              <div key={attr.label} className="flex flex-col items-center justify-center bg-card border border-stroke rounded-lg p-1.5">
                <div className="text-xs font-semibold text-muted">{attr.label}</div>
                <Rollable label={attr.label} modifier={attr.modifier}>
                  <div className="text-base font-bold">{attr.modifier >= 0 ? '+' : ''}{attr.modifier}</div>
                </Rollable>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-1.5 mb-2">
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
          <hr className="h-px bg-stroke mb-2 flex-shrink-0" />

          <div className="grid grid-cols-2 gap-1.5 mb-2 flex-1">
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
          <hr className="h-px bg-stroke mb-2 flex-shrink-0" />

          {/* Misc Info Section */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5 mb-2">
            <div className="min-w-0 overflow-hidden">
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
            </div>

            <div className="flex flex-col gap-1.5 min-w-0 order-2 lg:order-3">
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

            <div className="grid grid-cols-2 lg:flex lg:flex-col gap-1.5 min-w-0 order-3 lg:order-2 col-span-2 lg:col-span-1">
              <Tooltip content="Sem bônus ou penalidade por tamanho" className="cursor-help lg:flex-1">
                <div className="bg-card border border-stroke rounded-lg p-1.5 h-full flex items-center">
                  <div className="flex items-center justify-between text-xs w-full">
                    <span className="font-semibold text-muted truncate">Tamanho</span>
                    <span className="font-bold">Médio</span>
                  </div>
                </div>
              </Tooltip>

              <div className="bg-card border border-stroke rounded-lg p-1.5 lg:flex-1 flex items-center">
                <div className="flex items-center justify-between text-xs w-full">
                  <span className="font-semibold text-muted truncate">Desloc.</span>
                  <span className="font-bold whitespace-nowrap">9m / 6q</span>
                </div>
              </div>
            </div>
          </div>

          {/* Separator */}
          <hr className="h-px bg-stroke mb-2 flex-shrink-0" />

          {/* Senses, Proficiencies Section */}
          <div className="grid grid-cols-2 gap-1.5 mb-2 flex-1">
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
          <hr className="h-px bg-stroke mb-2 flex-shrink-0" />

          {/* Equipment Section with inline currencies */}
          <div className="mb-2 flex-1">
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
        </div>

        {/* Vertical Separator */}
        <div className="w-px bg-stroke flex-shrink-0" />

        {/* RIGHT COLUMN: Shows other tabs */}
        <div className="flex-1 min-w-0 flex flex-col pl-2 overflow-y-auto" >
          {/* COMBATE TAB */}
          {activeNavDesktop === 'combat' && (
            <div className="grid overflow-y-auto " style={{ height: '-webkit-fill-available' }}>
              <CombatTabDesktop
              character={character}
              weaponModalOpen={weaponModalOpen}
              choiceModalOpen={choiceModalOpen}
              pendingAction={pendingAction}
              onStartTurn={onStartTurn}
              onRollInitiative={onRollInitiative}
              onToggleCombat={onToggleCombat}
              onUseAction={onUseAction}
              onUseWeapon={onUseWeapon}
              onUseAbility={onUseAbility}
              onRollDamage={onRollDamage}
              onReorderFavorites={onReorderFavorites}
              onToggleFavoriteAction={onToggleFavoriteAction}
              onToggleFavoriteAbility={onToggleFavoriteAbility}
              onSetWeaponModalOpen={onSetWeaponModalOpen}
              onAddWeapon={onAddWeapon}
              onUpdateWeapon={onUpdateWeapon}
              onRemoveWeapon={onRemoveWeapon}
              onToggleFavoriteWeapon={onToggleFavoriteWeapon}
              onSetChoiceModalOpen={onSetChoiceModalOpen}
              onChoiceSelect={onChoiceSelect}
              />
            </div>
          )}

          {/* OUTROS TAB */}
          {activeNavDesktop === 'other' && (
            <OtherTab
              character={character}
              onResistancesChange={onResistancesChange}
            />
          )}

          {/* HABILIDADES TAB */}
          {activeNavDesktop === 'abilities' && (
            <AbilitiesTab
              character={character}
              onAddActiveEffect={onAddActiveEffect}
              onToggleFavoriteAbility={onToggleFavoriteAbility}
              onToggleFavoriteSpell={onToggleFavoriteSpell}
              onManaChange={onManaChange}
              onHealthChange={onHealthChange}
            />
          )}

          {/* INVENTÁRIO TAB */}
          {activeNavDesktop === 'inventory' && (
            <InventoryTab
              character={character}
              onBackpackChange={onBackpackChange}
              onEquippedItemsChange={onEquippedItemsChange}
              onCurrenciesChange={onCurrenciesChange}
              onUseConsumable={onUseConsumable}
              onCombatAction={onCombatAction}
            />
          )}

          {/* Desktop/Tablet Navigation - Inside right column */}
          <div className="mt-auto pt-4 sticky bottom-0 bg-bg">
            <BottomNavigation
              items={navItemsDesktop}
              activeItem={activeNavDesktop}
              onItemChange={onNavChange}
              isFixed={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
