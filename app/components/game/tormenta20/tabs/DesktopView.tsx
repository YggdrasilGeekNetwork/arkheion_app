import type { Character, CombatAction, WeaponAttack, EquippedItems, EquipmentItem, Currencies, ActiveEffect, Ability } from '~/types/character'
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

type NavItem = { id: string; label: string }
import Rollable from '../Rollable'
import HealthCard from '../HealthCard'
import ManaCard from '../ManaCard'
import SkillsCard from '../SkillsCard'
import EquippedItemsSummaryCard from '../EquippedItemsSummaryCard'
import ActiveEffectsSection from '../ActiveEffectsSection'
import BottomNavigation from '../BottomNavigation'
import AbilitiesTab from './AbilitiesTab'
import InventoryTab from './InventoryTab'
import OtherTab from './OtherTab'
import CombatTabDesktop from './CombatTabDesktop'

type DesktopViewProps = {
  character: Character
  activeNavDesktop: string
  navItemsDesktop: NavItem[]
  weaponModalOpen: boolean
  choiceModalOpen: boolean
  pendingAction: CombatAction | null
  onHealthChange: (delta: number) => void
  onManaChange: (delta: number) => void
  onSkillsChange: (newSkills: Character['skills']) => void
  onBleedingRoll: () => Promise<void>
  onConRoll: () => void
  onRollInitiative: (result: number) => void
  onToggleCombat: () => void
  onSwitchToCombat: () => void
  onEquippedItemsChange: (newItems: EquippedItems) => void
  onBackpackChange: (newBackpack: (EquipmentItem | null)[]) => void
  onCurrenciesChange: (newCurrencies: Currencies) => void
  onResistancesChange: (newResistances: Character['resistances']) => void
  onNotesChange: (notes: string) => void
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
  initiativeRequested?: boolean
  initiativeRolledForDM?: boolean
  combatActiveDM?: boolean
  currentTurnName?: string | null
  dmRound?: number
  isMyTurnDM?: boolean
  onEndTurn?: () => void
}

export default function DesktopView({
  character,
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
  onEquippedItemsChange,
  onBackpackChange,
  onCurrenciesChange,
  onResistancesChange,
  onNotesChange,
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
  initiativeRequested,
  initiativeRolledForDM,
  combatActiveDM,
  currentTurnName,
  dmRound,
  isMyTurnDM,
  onEndTurn,
}: DesktopViewProps) {
  return (
    <div className="hidden md:flex md:justify-center flex-1" style={{ height: '-webkit-fill-available' }}>
      <div className="flex w-full max-w-[96vw] px-[2vw]" style={{ height: '-webkit-fill-available' }}>
        {/* LEFT COLUMN: Always shows Summary */}
        <div className="flex-1 min-w-0 flex flex-col overflow-y-auto pr-2" style={{ height: '-webkit-fill-available' }}>
          {/* Attributes Section */}
          <div className="grid grid-cols-6 gap-1.5 mb-2">
            {character.attributes.map((attr) => (
              <div key={attr.label} title={ATTR_TOOLTIP[attr.label]} className="flex flex-col items-center justify-center bg-card border border-stroke rounded-lg p-2 cursor-help">
                <div className="text-sm font-semibold text-muted">{ATTR_ABBR[attr.label] ?? attr.label.toUpperCase()}</div>
                <Rollable label={attr.label} modifier={attr.modifier}>
                  <div className="text-lg font-bold">{attr.modifier >= 0 ? '+' : ''}{attr.modifier}</div>
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

          {/* Senses/Proficiencies + Misc Info Section */}
          <MiscGrid
            cards={buildMiscCards(character, onSwitchToCombat, onRollInitiative)}
            minColWidth={500}
            gap={6}
            className="mb-2"
          />

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
              initiativeRequested={initiativeRequested}
              initiativeRolledForDM={initiativeRolledForDM}
              combatActiveDM={combatActiveDM}
              currentTurnName={currentTurnName}
              dmRound={dmRound}
              isMyTurnDM={isMyTurnDM}
              onEndTurn={onEndTurn}
              />
            </div>
          )}

          {/* OUTROS TAB */}
          {activeNavDesktop === 'other' && (
            <OtherTab
              character={character}
              onResistancesChange={onResistancesChange}
              onNotesChange={onNotesChange}
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
