import type { Character, Sense, Proficiency, CombatAction, WeaponAttack } from '~/types/character'
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
import EquipmentCard from '../EquipmentCard'
import ResistanceCard from '../ResistanceCard'
import BottomNavigation from '../BottomNavigation'
import type { NavItem } from '~/types/character'
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
  onSwitchToCombat: () => void
  onSensesChange: (newSenses: Sense[]) => void
  onProficienciesChange: (newProficiencies: Proficiency[]) => void
  onEquippedItemsChange: (newItems: typeof character.equippedItems) => void
  onBackpackChange: (newBackpack: typeof character.backpack) => void
  onCurrenciesChange: (newCurrencies: typeof character.currencies) => void
  onResistancesChange: (newResistances: typeof character.resistances) => void
  onNavChange: (nav: string) => void
  onStartTurn: () => void
  onUseAction: (action: CombatAction) => void
  onUseWeapon: (weapon: WeaponAttack) => void
  onRollDamage: (weapon: WeaponAttack) => void
  onReorderFavorites: (newWeapons: WeaponAttack[], newActions: CombatAction[]) => void
  onToggleFavoriteAction: (actionId: string) => void
  onSetWeaponModalOpen: (open: boolean) => void
  onAddWeapon: (weapon: Omit<WeaponAttack, 'id'>) => void
  onUpdateWeapon: (weaponId: string, weaponData: Omit<WeaponAttack, 'id' | 'isFavorite'>) => Promise<void>
  onRemoveWeapon: (weaponId: string) => void
  onToggleFavoriteWeapon: (weaponId: string) => void
  onSetChoiceModalOpen: (open: boolean) => void
  onChoiceSelect: (choice: string) => void
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
  onRollDamage,
  onReorderFavorites,
  onToggleFavoriteAction,
  onSetWeaponModalOpen,
  onAddWeapon,
  onUpdateWeapon,
  onRemoveWeapon,
  onToggleFavoriteWeapon,
  onSetChoiceModalOpen,
  onChoiceSelect,
}: DesktopViewProps) {
  return (
    <div className="hidden md:flex md:justify-center flex-1" style={{ height: '-webkit-fill-available' }}>
      <div className="flex w-full max-w-[96vw] px-[2vw]" style={{ height: '-webkit-fill-available' }}>
        {/* LEFT COLUMN: Always shows Summary */}
        <div className="flex-1 min-w-0 flex flex-col overflow-y-auto pr-2" style={{ height: '-webkit-fill-available' }}>
          {/* Attributes Section */}
          <div className="grid grid-cols-6 gap-2 mb-3">
            {character.attributes.map((attr) => (
              <div key={attr.label} className="flex flex-col items-center bg-card border border-stroke rounded-lg p-2">
                <div className="text-sm font-semibold text-muted">{attr.label}</div>
                <Rollable label={attr.label} modifier={attr.modifier}>
                  <div className="text-lg font-bold">{attr.modifier >= 0 ? '+' : ''}{attr.modifier}</div>
                </Rollable>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
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
          <hr className="h-px bg-stroke mb-3" />

          <div className="grid grid-cols-2 gap-2 mb-3">
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
          <hr className="h-px bg-stroke mb-3" />

          {/* Misc Info Section */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <Tooltip content="Sem bônus ou penalidade por tamanho" className="cursor-help">
              <div className="bg-card border border-stroke rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-muted">Tamanho <span className="opacity-50">?</span></span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">Médio</span>
                    <span>|</span>
                    <span className="text-muted">+0/-0</span>
                  </div>
                </div>
              </div>
            </Tooltip>

            <div className="bg-card border border-stroke rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
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
          <hr className="h-px bg-stroke mb-3" />

          {/* Senses, Proficiencies Section */}
          <div className="grid grid-cols-2 gap-2 mb-3">
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
          <hr className="h-px bg-stroke mb-3" />

          {/* Equipment Section */}
          <div className="flex-1">
            <EquipmentCard
            desModifier={character.attributes.find(a => a.label === 'DES')?.modifier || 0}
            equippedItems={character.equippedItems}
            backpack={character.backpack}
            currencies={character.currencies}
            onBackpackChange={onBackpackChange}
            onEquippedItemsChange={onEquippedItemsChange}
            onCurrenciesChange={onCurrenciesChange}
            />
          </div>
        </div>

        {/* Vertical Separator */}
        <div className="w-px bg-stroke flex-shrink-0" />

        {/* RIGHT COLUMN: Shows other tabs */}
        <div className="flex-1 min-w-0 flex flex-col pl-2" >
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
              onUseAction={onUseAction}
              onUseWeapon={onUseWeapon}
              onRollDamage={onRollDamage}
              onReorderFavorites={onReorderFavorites}
              onToggleFavoriteAction={onToggleFavoriteAction}
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
          {activeNavDesktop === 'abilities' && <AbilitiesTab />}

          {/* INVENTÁRIO TAB */}
          {activeNavDesktop === 'inventory' && (
            <InventoryTab
              character={character}
              onBackpackChange={onBackpackChange}
              onEquippedItemsChange={onEquippedItemsChange}
              onCurrenciesChange={onCurrenciesChange}
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
