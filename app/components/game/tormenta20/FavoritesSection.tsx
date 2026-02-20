import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { CombatAction, WeaponAttack, Ability, EquippedItems } from '~/types/character'
import ActionItem from './ActionItem'
import WeaponItem from './WeaponItem'
import AbilityItem from './AbilityItem'

type FavoritesSectionProps = {
  actions: CombatAction[]
  weapons: WeaponAttack[]
  abilities?: Ability[]
  equippedItems?: EquippedItems
  onUseAction: (action: CombatAction) => void
  onUseWeapon: (weapon: WeaponAttack) => void
  onUseAbility?: (ability: Ability) => void
  onRollDamage: (weapon: WeaponAttack) => void
  onReorderFavorites: (weapons: WeaponAttack[], actions: CombatAction[], abilities?: Ability[]) => void
  isOutOfTurn?: boolean
}

type FavoriteItem = {
  id: string
  type: 'weapon' | 'action' | 'ability'
  order: number
  data: WeaponAttack | CombatAction | Ability
}

// Check if a weapon's equipment is equipped
function isWeaponEquipped(weapon: WeaponAttack, equippedItems?: EquippedItems): boolean {
  if (!weapon.equipmentId || !equippedItems) return true // No equipment link means always available
  // Check if the equipment is in any hand slot
  return [
    equippedItems.rightHand,
    equippedItems.leftHand,
    equippedItems.quickDraw1,
    equippedItems.quickDraw2,
  ].some(item => item?.id === weapon.equipmentId)
}

// Sortable Item Component
function SortableItem({ item, onUseAction, onUseWeapon, onUseAbility, onRollDamage, isDisabled, isOutOfTurn }: {
  item: FavoriteItem
  onUseAction: (action: CombatAction) => void
  onUseWeapon: (weapon: WeaponAttack) => void
  onUseAbility?: (ability: Ability) => void
  onRollDamage: (weapon: WeaponAttack) => void
  isDisabled?: boolean
  isOutOfTurn?: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    breakInside: 'avoid' as const,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`mb-2 ${isOver ? 'ring-2 ring-accent rounded-lg' : ''}`}
    >
      <div
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="touch-none"
      >
        {item.type === 'weapon' ? (
          <WeaponItem
            weapon={item.data as WeaponAttack}
            onUse={onUseWeapon}
            onRollDamage={onRollDamage}
            compact={true}
            disabled={isDisabled}
          />
        ) : item.type === 'ability' ? (
          <AbilityItem
            ability={item.data as Ability}
            onUse={onUseAbility || (() => {})}
            compact={true}
            isOutOfTurn={isOutOfTurn}
          />
        ) : (
          <ActionItem
            action={item.data as CombatAction}
            onUse={onUseAction}
            compact={true}
            isOutOfTurn={isOutOfTurn}
          />
        )}
      </div>
    </div>
  )
}

export default function FavoritesSection({
  actions,
  weapons,
  abilities = [],
  equippedItems,
  onUseAction,
  onUseWeapon,
  onUseAbility,
  onRollDamage,
  onReorderFavorites,
  isOutOfTurn = false,
}: FavoritesSectionProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const favoriteActions = actions.filter(a => a.isFavorite)
  const favoriteWeapons = weapons.filter(w => w.isFavorite)
  const favoriteAbilities = abilities.filter(a => a.isFavorite && a.type === 'active')

  // Configure sensors to require movement before drag starts
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10, // 10px of movement required before drag starts
      },
    })
  )

  // Combine favorites into a single array with type and order
  const favoriteItems: FavoriteItem[] = [
    ...favoriteWeapons.map(w => ({
      id: w.id,
      type: 'weapon' as const,
      order: w.favoriteOrder ?? 999999,
      data: w
    })),
    ...favoriteActions.map(a => ({
      id: a.id,
      type: 'action' as const,
      order: a.favoriteOrder ?? 999999,
      data: a
    })),
    ...favoriteAbilities.map(a => ({
      id: a.id,
      type: 'ability' as const,
      order: a.favoriteOrder ?? 999999,
      data: a
    }))
  ].sort((a, b) => a.order - b.order)

  if (favoriteItems.length === 0) {
    return null
  }

  const activeItem = favoriteItems.find(item => item.id === activeId)

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = favoriteItems.findIndex(item => item.id === active.id)
    const newIndex = favoriteItems.findIndex(item => item.id === over.id)

    // Reorder items
    const newItems = [...favoriteItems]
    const [removed] = newItems.splice(oldIndex, 1)
    newItems.splice(newIndex, 0, removed)

    // Assign new order numbers
    const updatedWeapons = [...weapons]
    const updatedActions = [...actions]
    const updatedAbilities = [...abilities]

    newItems.forEach((item, index) => {
      if (item.type === 'weapon') {
        const weaponIndex = updatedWeapons.findIndex(w => w.id === item.id)
        if (weaponIndex !== -1) {
          updatedWeapons[weaponIndex] = { ...updatedWeapons[weaponIndex], favoriteOrder: index }
        }
      } else if (item.type === 'ability') {
        const abilityIndex = updatedAbilities.findIndex(a => a.id === item.id)
        if (abilityIndex !== -1) {
          updatedAbilities[abilityIndex] = { ...updatedAbilities[abilityIndex], favoriteOrder: index }
        }
      } else {
        const actionIndex = updatedActions.findIndex(a => a.id === item.id)
        if (actionIndex !== -1) {
          updatedActions[actionIndex] = { ...updatedActions[actionIndex], favoriteOrder: index }
        }
      }
    })

    onReorderFavorites(updatedWeapons, updatedActions, updatedAbilities)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="mb-3">
        <div className="text-sm font-bold text-muted mb-2 flex items-center gap-1">
          <span>★</span>
          <span>Favoritos</span>
        </div>

        {/* Masonry layout using CSS columns */}
        <SortableContext items={favoriteItems.map(item => item.id)} strategy={rectSortingStrategy}>
          <div
            className="gap-2"
            style={{
              columnCount: 2,
              columnGap: '0.5rem',
            }}
          >
            {favoriteItems.map((item) => (
              <SortableItem
                key={item.id}
                item={item}
                onUseAction={onUseAction}
                onUseWeapon={onUseWeapon}
                onUseAbility={onUseAbility}
                onRollDamage={onRollDamage}
                isDisabled={item.type === 'weapon' && !isWeaponEquipped(item.data as WeaponAttack, equippedItems)}
                isOutOfTurn={isOutOfTurn}
              />
            ))}
          </div>
        </SortableContext>
      </div>

      <DragOverlay>
        {activeItem ? (
          <div className="opacity-80 rotate-3 scale-105">
            {activeItem.type === 'weapon' ? (
              <WeaponItem
                weapon={activeItem.data as WeaponAttack}
                onUse={onUseWeapon}
                onRollDamage={onRollDamage}
                compact={true}
                disabled={!isWeaponEquipped(activeItem.data as WeaponAttack, equippedItems)}
              />
            ) : activeItem.type === 'ability' ? (
              <AbilityItem
                ability={activeItem.data as Ability}
                onUse={onUseAbility || (() => {})}
                compact={true}
              />
            ) : (
              <ActionItem
                action={activeItem.data as CombatAction}
                onUse={onUseAction}
                compact={true}
              />
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
