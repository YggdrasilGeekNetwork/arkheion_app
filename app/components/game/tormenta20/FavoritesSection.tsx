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
import type { CombatAction, WeaponAttack } from '~/types/character'
import ActionItem from './ActionItem'
import WeaponItem from './WeaponItem'

type FavoritesSectionProps = {
  actions: CombatAction[]
  weapons: WeaponAttack[]
  onUseAction: (action: CombatAction) => void
  onUseWeapon: (weapon: WeaponAttack) => void
  onRollDamage: (weapon: WeaponAttack) => void
  onReorderFavorites: (weapons: WeaponAttack[], actions: CombatAction[]) => void
}

type FavoriteItem = {
  id: string
  type: 'weapon' | 'action'
  order: number
  data: WeaponAttack | CombatAction
}

// Sortable Item Component
function SortableItem({ item, onUseAction, onUseWeapon, onRollDamage }: {
  item: FavoriteItem
  onUseAction: (action: CombatAction) => void
  onUseWeapon: (weapon: WeaponAttack) => void
  onRollDamage: (weapon: WeaponAttack) => void
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
          />
        ) : (
          <ActionItem
            action={item.data as CombatAction}
            onUse={onUseAction}
            compact={true}
          />
        )}
      </div>
    </div>
  )
}

export default function FavoritesSection({
  actions,
  weapons,
  onUseAction,
  onUseWeapon,
  onRollDamage,
  onReorderFavorites,
}: FavoritesSectionProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const favoriteActions = actions.filter(a => a.isFavorite)
  const favoriteWeapons = weapons.filter(w => w.isFavorite)

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

    newItems.forEach((item, index) => {
      if (item.type === 'weapon') {
        const weaponIndex = updatedWeapons.findIndex(w => w.id === item.id)
        if (weaponIndex !== -1) {
          updatedWeapons[weaponIndex] = { ...updatedWeapons[weaponIndex], favoriteOrder: index }
        }
      } else {
        const actionIndex = updatedActions.findIndex(a => a.id === item.id)
        if (actionIndex !== -1) {
          updatedActions[actionIndex] = { ...updatedActions[actionIndex], favoriteOrder: index }
        }
      }
    })

    onReorderFavorites(updatedWeapons, updatedActions)
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
                onRollDamage={onRollDamage}
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
