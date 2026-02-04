import type { Character, CombatAction, WeaponAttack, Ability } from '~/types/character'
import InitiativeRoller from '../InitiativeRoller'
import HealthCard from '../HealthCard'
import ManaCard from '../ManaCard'
import ActionIndicator from '../ActionIndicator'
import DefenseCard from '../DefenseCard'
import SkillsCard from '../SkillsCard'
import FavoritesSection from '../FavoritesSection'
import ActionsCollapsible from '../ActionsCollapsible'
import AbilitiesCollapsible from '../AbilitiesCollapsible'
import WeaponModal from '../WeaponModal'
import ChoiceModal from '../ChoiceModal'

type CombatTabProps = {
  character: Character
  weaponModalOpen: boolean
  choiceModalOpen: boolean
  pendingAction: CombatAction | null
  onHealthChange: (delta: number) => void
  onManaChange: (delta: number) => void
  onBleedingRoll: () => void
  onConRoll: () => void
  onStartTurn: () => void
  onRollInitiative: (result: number) => void
  onToggleCombat: () => void
  onSkillsChange: (newSkills: Character['skills']) => void
  onUseAction: (action: CombatAction) => void
  onUseWeapon: (weapon: WeaponAttack) => void
  onUseAbility?: (ability: Ability) => void
  onRollDamage: (weapon: WeaponAttack) => void
  onReorderFavorites: (newWeapons: WeaponAttack[], newActions: CombatAction[], newAbilities?: Ability[]) => void
  onToggleFavoriteAction: (actionId: string) => void
  onToggleFavoriteAbility?: (abilityId: string) => void
  onSetWeaponModalOpen: (open: boolean) => void
  onAddWeapon: (weapon: Omit<WeaponAttack, 'id'>) => void
  onUpdateWeapon: (weaponId: string, weaponData: Omit<WeaponAttack, 'id' | 'isFavorite'>) => Promise<void>
  onRemoveWeapon: (weaponId: string) => void
  onToggleFavoriteWeapon: (weaponId: string) => void
  onSetChoiceModalOpen: (open: boolean) => void
  onChoiceSelect: (choice: string) => void
}

export default function CombatTab({
  character,
  weaponModalOpen,
  choiceModalOpen,
  pendingAction,
  onHealthChange,
  onManaChange,
  onBleedingRoll,
  onConRoll,
  onStartTurn,
  onRollInitiative,
  onToggleCombat,
  onSkillsChange,
  onUseAction,
  onUseWeapon,
  onUseAbility,
  onRollDamage,
  onReorderFavorites,
  onToggleFavoriteAction,
  onToggleFavoriteAbility,
  onSetWeaponModalOpen,
  onAddWeapon,
  onUpdateWeapon,
  onRemoveWeapon,
  onToggleFavoriteWeapon,
  onSetChoiceModalOpen,
  onChoiceSelect,
}: CombatTabProps) {
  return (
    <>
      {/* Initiative Roller */}
      <InitiativeRoller
        initiativeModifier={character.attributes.find(a => a.label === 'DES')?.modifier || 0}
        currentRoll={character.initiativeRoll}
        onStartTurn={onStartTurn}
        onRollInitiative={onRollInitiative}
        isMyTurn={character.isMyTurn}
        inCombat={character.inCombat}
        onToggleCombat={onToggleCombat}
      />

      {/* HP and MP */}
      <div className="grid grid-cols-2 gap-2 mb-2">
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

      {/* Action Indicator - Only show in combat */}
      {character.inCombat && (
        <ActionIndicator availableActions={character.availableActions} />
      )}

      {/* Defense and Combat Skills */}
      <div className="grid grid-cols-2 gap-2 mb-2">
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
          mode="combat"
        />
      </div>

      {/* Favorites Section */}
      <FavoritesSection
        actions={character.actionsList}
        weapons={character.weapons}
        abilities={character.abilities}
        onUseAction={onUseAction}
        onUseWeapon={onUseWeapon}
        onUseAbility={onUseAbility}
        onRollDamage={onRollDamage}
        onReorderFavorites={onReorderFavorites}
      />

      {/* Actions Collapsible */}
      <ActionsCollapsible
        actions={character.actionsList}
        onUseAction={onUseAction}
        onToggleFavorite={onToggleFavoriteAction}
      />

      {/* Abilities Collapsible */}
      {character.abilities && onUseAbility && onToggleFavoriteAbility && (
        <AbilitiesCollapsible
          abilities={character.abilities}
          onUseAbility={onUseAbility}
          onToggleFavorite={onToggleFavoriteAbility}
        />
      )}

      {/* Manage Weapons Button */}
      <button
        onClick={() => onSetWeaponModalOpen(true)}
        className="w-full py-2  bg-card border border-stroke rounded hover:border-accent transition-colors font-semibold text-sm mt-3"
      >
        ⚔️ Gerenciar Ataques
      </button>

      {/* Weapon Modal */}
      <WeaponModal
        isOpen={weaponModalOpen}
        onClose={() => onSetWeaponModalOpen(false)}
        weapons={character.weapons}
        onAddWeapon={onAddWeapon}
        onUpdateWeapon={onUpdateWeapon}
        onRemoveWeapon={onRemoveWeapon}
        onToggleFavorite={onToggleFavoriteWeapon}
      />

      {/* Choice Modal */}
      <ChoiceModal
        isOpen={choiceModalOpen}
        onClose={() => onSetChoiceModalOpen(false)}
        actionName={pendingAction?.name || ''}
        choices={pendingAction?.choices || []}
        onSelect={onChoiceSelect}
      />
    </>
  )
}
