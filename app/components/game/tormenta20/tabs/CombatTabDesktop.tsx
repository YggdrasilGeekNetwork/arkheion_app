import type { Character, CombatAction, WeaponAttack, Ability } from '~/types/character'
import InitiativeRoller from '../InitiativeRoller'
import ActionIndicator from '../ActionIndicator'
import FavoritesSection from '../FavoritesSection'
import ActionsCollapsible from '../ActionsCollapsible'
import WeaponModal from '../WeaponModal'
import ChoiceModal from '../ChoiceModal'

type CombatTabDesktopProps = {
  character: Character
  weaponModalOpen: boolean
  choiceModalOpen: boolean
  pendingAction: CombatAction | null
  onStartTurn: () => void
  onRollInitiative: (result: number) => void
  onToggleCombat: () => void
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

export default function CombatTabDesktop({
  character,
  weaponModalOpen,
  choiceModalOpen,
  pendingAction,
  onStartTurn,
  onRollInitiative,
  onToggleCombat,
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
}: CombatTabDesktopProps) {
  return (
    <>
      <table className="w-full h-full" style={{ borderCollapse: 'collapse'   }}>
        <tbody>
          {/* Initiative Roller Row */}
          <tr>
            <td className="p-0">
              <InitiativeRoller
                initiativeModifier={character.attributes.find(a => a.label === 'DES')?.modifier || 0}
                currentRoll={character.initiativeRoll}
                onStartTurn={onStartTurn}
                onRollInitiative={onRollInitiative}
                isMyTurn={character.isMyTurn}
                inCombat={character.inCombat}
                onToggleCombat={onToggleCombat}
              />
            </td>
          </tr>

          {/* Action Indicator Row - Only show in combat */}
          {character.inCombat && (
            <tr>
              <td className="p-0">
                <ActionIndicator availableActions={character.availableActions} />
              </td>
            </tr>
          )}

          {/* Favorites Row */}
          <tr>
            <td>
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
            </td>
          </tr>

          {/* Scrollable Actions Row - expands to fill space */}
          <tr style={{ height: '100%' }}>
            <td className="p-0" style={{ height: '100%', verticalAlign: 'top' }}>
              <div
                className="overflow-y-auto space-y-2"
                style={{
                  height: '100%',
                  minHeight: '200px',
                  scrollbarWidth: 'thin',
                }}
              >
                <ActionsCollapsible
                  actions={character.actionsList}
                  abilities={character.abilities}
                  onUseAction={onUseAction}
                  onUseAbility={onUseAbility}
                  onToggleFavorite={onToggleFavoriteAction}
                  onToggleFavoriteAbility={onToggleFavoriteAbility}
                />
              </div>
            </td>
          </tr>

          {/* Button Row */}
          <tr>
            <td className="p-0 pt-4">
              <button
                onClick={() => onSetWeaponModalOpen(true)}
                className="w-full py-4 bg-card border-2 border-stroke rounded-lg hover:border-accent hover:shadow-md transition-all font-bold text-lg"
              >
                ⚔️ Gerenciar Ataques
              </button>
            </td>
          </tr>
        </tbody>
      </table>

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
