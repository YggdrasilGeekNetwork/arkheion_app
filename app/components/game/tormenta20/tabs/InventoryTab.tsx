import { useState, useRef } from 'react'
import type { Character, EquipmentItem } from '~/types/character'
import Card from '~/components/ui/Card'
import Modal from '~/components/ui/Modal'
import Tooltip from '~/components/ui/Tooltip'
import AddItemModal from '../AddItemModal'

type InventoryTabProps = {
  character: Character
  onBackpackChange: (newBackpack: Character['backpack']) => void
  onEquippedItemsChange: (newItems: Character['equippedItems']) => void
  onCurrenciesChange: (newCurrencies: Character['currencies']) => void
  onUseConsumable: (item: EquipmentItem, source: 'equipped' | 'backpack', slotKey: string) => void
  onCombatAction: (description: string, actionCost: string, execute: () => void) => void
}

type DragData = {
  item: EquipmentItem
  source: 'equipped' | 'backpack'
  sourceSlot: string // e.g., 'rightHand', 'backpack-0'
}

// Validation: Check if item can be equipped in a specific slot
function canEquipInSlot(item: EquipmentItem, slotName: string): boolean {
  const category = item.category || 'other'

  // If item specifies allowed slots, use those (most specific)
  if (item.allowedSlots && item.allowedSlots.length > 0) {
    return item.allowedSlots.includes(slotName as any)
  }

  // Quick draw slots - only small/light items
  if (slotName === 'quickDraw1' || slotName === 'quickDraw2') {
    return category === 'weapon' || category === 'alchemical' || category === 'tool'
  }

  // Hands and utility slots accept any item by default
  // The player decides what makes sense for their character
  return true
}

// Backpack types with their slot capacities
const BACKPACK_TYPES = {
  small: { name: 'Pequena', slots: 12, description: '12 espaços' },
  medium: { name: 'Média', slots: 20, description: '20 espaços' },
  large: { name: 'Grande', slots: 30, description: '30 espaços' },
  extraLarge: { name: 'Extra Grande', slots: 50, description: '50 espaços' },
} as const

const SLOT_LABELS: Record<string, string> = {
  rightHand: 'Mão Direita',
  leftHand: 'Mão Esquerda',
  quickDraw1: 'Saque Rápido 1',
  quickDraw2: 'Saque Rápido 2',
  slot1: 'Slot 1',
  slot2: 'Slot 2',
  slot3: 'Slot 3',
  slot4: 'Slot 4',
}

type BackpackType = keyof typeof BACKPACK_TYPES

const QUICK_ACCESS_SLOTS = ['rightHand', 'leftHand', 'quickDraw1', 'quickDraw2']

export default function InventoryTab({
  character,
  onBackpackChange,
  onEquippedItemsChange,
  onCurrenciesChange,
  onUseConsumable,
  onCombatAction,
}: InventoryTabProps) {
  const [addItemModalOpen, setAddItemModalOpen] = useState(false)
  const [draggedItem, setDraggedItem] = useState<DragData | null>(null)
  const [backpackType, setBackpackType] = useState<BackpackType>('medium')
  const [backpackTypeModalOpen, setBackpackTypeModalOpen] = useState(false)
  const [selectedBackpackIndex, setSelectedBackpackIndex] = useState<number | null>(null)
  const [selectedEquippedSlot, setSelectedEquippedSlot] = useState<string | null>(null)
  const [editingCurrency, setEditingCurrency] = useState<'to' | 'tp' | 'tc' | null>(null)
  const [editCurrencyValue, setEditCurrencyValue] = useState('')
  const dragStartedRef = useRef(false)

  // Pending drop when target slot is occupied
  const [pendingDrop, setPendingDrop] = useState<{
    dragData: DragData
    targetSlot: string
    targetSource: 'equipped' | 'backpack'
    existingItem: EquipmentItem
    // For two-handed items: track both hand items and their decisions
    secondHandItem?: EquipmentItem | null
    rightHandDecision?: 'backpack' | 'ground' | null
    leftHandDecision?: 'backpack' | 'ground' | null
  } | null>(null)

  // Pending versatile weapon choice (one-handed or two-handed)
  const [pendingVersatile, setPendingVersatile] = useState<{
    dragData: DragData
    targetSlot: string
  } | null>(null)

  // Pending grip toggle for equipped versatile weapon
  const [pendingGripToggle, setPendingGripToggle] = useState<{
    item: EquipmentItem
    otherHandItem: EquipmentItem
  } | null>(null)

  // Calculate carry capacity: 10 + (2 × FOR modifier)
  const forModifier = character.attributes.find(a => a.label === 'FOR')?.modifier || 0
  const maxCarrySpaces = 10 + (2 * forModifier)

  // Calculate current carry weight (spaces)
  const calculateItemSpaces = (item: any) => {
    if (!item) return 0
    return (item.spaces || 1) * (item.quantity || 1)
  }

  const equippedSpaces = Object.values(character.equippedItems)
    .reduce((total, item) => total + calculateItemSpaces(item), 0)

  const backpackItemSpaces = character.backpack
    .reduce((total, item) => total + calculateItemSpaces(item), 0)

  // Calculate currency spaces: every 1000 coins of each type = 1 slot
  const toSpaces = Math.ceil(character.currencies.to / 1000)
  const tpSpaces = Math.ceil(character.currencies.tp / 1000)
  const tcSpaces = Math.ceil(character.currencies.tc / 1000)
  const currencySpaces = toSpaces + tpSpaces + tcSpaces

  const backpackSpaces = backpackItemSpaces + currencySpaces

  const totalSpaces = equippedSpaces + backpackSpaces
  const isOverloaded = totalSpaces > maxCarrySpaces
  const isEncumbered = totalSpaces > maxCarrySpaces * 2

  // Drag handlers
  const handleDragStart = (item: EquipmentItem, source: 'equipped' | 'backpack', sourceSlot: string) => {
    setDraggedItem({ item, source, sourceSlot })
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  const handleDrop = (targetSlot: string, targetSource: 'equipped' | 'backpack') => {
    if (!draggedItem) return

    const { item, source, sourceSlot } = draggedItem
    const isHandSlot = targetSlot === 'rightHand' || targetSlot === 'leftHand'
    const isTwoHanded = item.twoHanded

    // Validate if item can be equipped in this slot
    if (targetSource === 'equipped' && !canEquipInSlot(item, targetSlot)) {
      console.log('Cannot equip this item type in this slot')
      setDraggedItem(null)
      return
    }

    // Two-handed items can only go in hand slots
    if (isTwoHanded && targetSource === 'equipped' && !isHandSlot) {
      console.log('Two-handed items can only be equipped in hand slots')
      setDraggedItem(null)
      return
    }

    // Versatile weapons: ask if player wants to use one-handed or two-handed
    if (item.versatile && source === 'backpack' && targetSource === 'equipped' && isHandSlot) {
      setPendingVersatile({
        dragData: draggedItem,
        targetSlot,
      })
      setDraggedItem(null)
      return
    }

    // Check if target slot is occupied (for backpack to equipped or equipped to equipped)
    let existingItem: EquipmentItem | null = null
    if (targetSource === 'equipped') {
      existingItem = character.equippedItems[targetSlot as keyof typeof character.equippedItems]
      // For two-handed items, also check the other hand
      if (isTwoHanded && isHandSlot) {
        const otherHand = targetSlot === 'rightHand' ? 'leftHand' : 'rightHand'
        const otherHandItem = character.equippedItems[otherHand]
        if (otherHandItem && !existingItem) {
          existingItem = otherHandItem
        }
      }
    } else if (targetSource === 'backpack') {
      const targetIndex = parseInt(targetSlot.replace('backpack-', ''))
      existingItem = character.backpack[targetIndex]
    }

    // If target is occupied and we're moving from backpack to equipped, show modal
    if (existingItem && source === 'backpack' && targetSource === 'equipped') {
      // For two-handed items, capture both hand items
      if (isTwoHanded && isHandSlot) {
        const rightHandItem = character.equippedItems.rightHand
        const leftHandItem = character.equippedItems.leftHand
        setPendingDrop({
          dragData: draggedItem,
          targetSlot: 'rightHand',
          targetSource,
          existingItem: rightHandItem || leftHandItem!,
          secondHandItem: rightHandItem && leftHandItem ? leftHandItem : null,
          rightHandDecision: rightHandItem ? null : undefined,
          leftHandDecision: leftHandItem ? null : undefined,
        })
      } else {
        setPendingDrop({
          dragData: draggedItem,
          targetSlot: isTwoHanded ? 'rightHand' : targetSlot,
          targetSource,
          existingItem,
        })
      }
      setDraggedItem(null)
      return
    }

    // Handle equipped to equipped (swap directly)
    if (source === 'equipped' && targetSource === 'equipped') {
      const newEquipped = { ...character.equippedItems }
      const targetItem = newEquipped[targetSlot as keyof typeof newEquipped]

      // If source is two-handed, clear both hands
      if (character.equippedItems[sourceSlot as keyof typeof character.equippedItems]?.twoHanded) {
        newEquipped.rightHand = null
        newEquipped.leftHand = null
      }

      // Swap items
      newEquipped[sourceSlot as keyof typeof newEquipped] = targetItem
      newEquipped[targetSlot as keyof typeof newEquipped] = item

      // If target item is two-handed, it goes to rightHand and clears leftHand
      if (isTwoHanded && isHandSlot) {
        newEquipped.rightHand = item
        newEquipped.leftHand = null
      }

      onEquippedItemsChange(newEquipped)
    }

    // Handle equipped to backpack (swap directly)
    if (source === 'equipped' && targetSource === 'backpack') {
      const backpackIndex = parseInt(targetSlot.replace('backpack-', ''))
      const newEquipped = { ...character.equippedItems }
      const newBackpack = [...character.backpack]

      // Swap items
      const targetItem = newBackpack[backpackIndex]

      // If source is two-handed, clear both hands
      if (character.equippedItems[sourceSlot as keyof typeof character.equippedItems]?.twoHanded) {
        newEquipped.rightHand = targetItem
        newEquipped.leftHand = null
      } else {
        newEquipped[sourceSlot as keyof typeof newEquipped] = targetItem
      }
      newBackpack[backpackIndex] = item

      onEquippedItemsChange(newEquipped)
      onBackpackChange(newBackpack)
    }

    // Handle backpack to equipped (only if slot is empty - otherwise modal is shown)
    if (source === 'backpack' && targetSource === 'equipped' && !existingItem) {
      const backpackIndex = parseInt(sourceSlot.replace('backpack-', ''))
      const newEquipped = { ...character.equippedItems }
      const newBackpack = [...character.backpack]

      newBackpack[backpackIndex] = null

      // If two-handed, equip in rightHand and clear leftHand
      if (isTwoHanded && isHandSlot) {
        newEquipped.rightHand = item
        newEquipped.leftHand = null
      } else {
        newEquipped[targetSlot as keyof typeof newEquipped] = item
      }

      onEquippedItemsChange(newEquipped)
      onBackpackChange(newBackpack)
    }

    // Handle backpack to backpack (swap directly)
    if (source === 'backpack' && targetSource === 'backpack') {
      const sourceIndex = parseInt(sourceSlot.replace('backpack-', ''))
      const targetIndex = parseInt(targetSlot.replace('backpack-', ''))
      const newBackpack = [...character.backpack]

      // Swap items
      const targetItem = newBackpack[targetIndex]
      newBackpack[sourceIndex] = targetItem
      newBackpack[targetIndex] = item

      onBackpackChange(newBackpack)
    }

    setDraggedItem(null)
  }

  // Handle pending drop - store existing item in backpack
  const handlePendingDropToBackpack = () => {
    if (!pendingDrop) return

    const { dragData, targetSlot, existingItem } = pendingDrop
    const backpackIndex = parseInt(dragData.sourceSlot.replace('backpack-', ''))
    const isTwoHanded = dragData.item.twoHanded
    const isHandSlot = targetSlot === 'rightHand' || targetSlot === 'leftHand'

    const newEquipped = { ...character.equippedItems }
    const newBackpack = [...character.backpack]

    // Put the existing item in the backpack (where the dragged item was)
    newBackpack[backpackIndex] = existingItem

    // If two-handed, also move leftHand item to backpack if it exists
    if (isTwoHanded && isHandSlot && newEquipped.leftHand && newEquipped.leftHand !== existingItem) {
      const emptyIndex = newBackpack.findIndex((item, idx) => !item && idx !== backpackIndex)
      if (emptyIndex >= 0) {
        newBackpack[emptyIndex] = newEquipped.leftHand
      } else {
        newBackpack.push(newEquipped.leftHand)
      }
    }

    // Put the dragged item in the equipped slot
    if (isTwoHanded && isHandSlot) {
      newEquipped.rightHand = dragData.item
      newEquipped.leftHand = null
    } else {
      newEquipped[targetSlot as keyof typeof newEquipped] = dragData.item
    }

    onEquippedItemsChange(newEquipped)
    onBackpackChange(newBackpack)
    setPendingDrop(null)
  }

  // Handle pending drop - drop existing item on ground
  const handlePendingDropToGround = () => {
    if (!pendingDrop) return

    const { dragData, targetSlot } = pendingDrop
    const backpackIndex = parseInt(dragData.sourceSlot.replace('backpack-', ''))
    const isTwoHanded = dragData.item.twoHanded
    const isHandSlot = targetSlot === 'rightHand' || targetSlot === 'leftHand'

    const newEquipped = { ...character.equippedItems }
    const newBackpack = [...character.backpack]

    // Remove the dragged item from backpack
    newBackpack[backpackIndex] = null

    // Put the dragged item in the equipped slot
    if (isTwoHanded && isHandSlot) {
      newEquipped.rightHand = dragData.item
      newEquipped.leftHand = null
    } else {
      newEquipped[targetSlot as keyof typeof newEquipped] = dragData.item
    }

    onEquippedItemsChange(newEquipped)
    onBackpackChange(newBackpack)
    setPendingDrop(null)
  }

  // Handle individual item decision for two-handed weapon equip
  const handleTwoHandedItemDecision = (hand: 'right' | 'left', decision: 'backpack' | 'ground') => {
    if (!pendingDrop) return

    const newPendingDrop = { ...pendingDrop }
    if (hand === 'right') {
      newPendingDrop.rightHandDecision = decision
    } else {
      newPendingDrop.leftHandDecision = decision
    }

    // Check if all decisions are made
    const rightHandItem = character.equippedItems.rightHand
    const leftHandItem = character.equippedItems.leftHand
    const rightDone = !rightHandItem || newPendingDrop.rightHandDecision
    const leftDone = !leftHandItem || newPendingDrop.leftHandDecision

    if (rightDone && leftDone) {
      // Process the equip action
      const { dragData } = pendingDrop
      const backpackIndex = parseInt(dragData.sourceSlot.replace('backpack-', ''))

      const newEquipped = { ...character.equippedItems }
      const newBackpack = [...character.backpack]

      // Remove the dragged item from backpack
      newBackpack[backpackIndex] = null

      // Process right hand item
      if (rightHandItem && newPendingDrop.rightHandDecision === 'backpack') {
        const emptyIndex = newBackpack.findIndex((item, idx) => !item && idx !== backpackIndex)
        if (emptyIndex >= 0) {
          newBackpack[emptyIndex] = rightHandItem
        } else {
          newBackpack.push(rightHandItem)
        }
      }
      // If ground, just don't add it to backpack

      // Process left hand item
      if (leftHandItem && newPendingDrop.leftHandDecision === 'backpack') {
        const emptyIndex = newBackpack.findIndex(item => !item)
        if (emptyIndex >= 0) {
          newBackpack[emptyIndex] = leftHandItem
        } else {
          newBackpack.push(leftHandItem)
        }
      }
      // If ground, just don't add it to backpack

      // Equip the two-handed item
      newEquipped.rightHand = dragData.item
      newEquipped.leftHand = null

      onEquippedItemsChange(newEquipped)
      onBackpackChange(newBackpack)
      setPendingDrop(null)
    } else {
      // Update pending drop with the decision
      setPendingDrop(newPendingDrop)
    }
  }

  // Handle versatile weapon choice (one-handed or two-handed)
  const handleVersatileChoice = (useTwoHanded: boolean) => {
    if (!pendingVersatile) return

    const { dragData, targetSlot } = pendingVersatile
    const backpackIndex = parseInt(dragData.sourceSlot.replace('backpack-', ''))
    const otherHand = targetSlot === 'rightHand' ? 'leftHand' : 'rightHand'
    const otherHandItem = character.equippedItems[otherHand as keyof typeof character.equippedItems]
    const targetSlotItem = character.equippedItems[targetSlot as keyof typeof character.equippedItems]

    // Mark the item with usingTwoHanded
    const itemToEquip = { ...dragData.item, usingTwoHanded: useTwoHanded }

    if (useTwoHanded) {
      // If two-handed and there are items in hands, show the pending drop modal
      if (otherHandItem || targetSlotItem) {
        const rightHandItem = character.equippedItems.rightHand
        const leftHandItem = character.equippedItems.leftHand
        setPendingDrop({
          dragData: { ...dragData, item: itemToEquip },
          targetSlot: 'rightHand',
          targetSource: 'equipped',
          existingItem: rightHandItem || leftHandItem!,
          secondHandItem: rightHandItem && leftHandItem ? leftHandItem : null,
          rightHandDecision: rightHandItem ? null : undefined,
          leftHandDecision: leftHandItem ? null : undefined,
        })
        setPendingVersatile(null)
        return
      }

      // No items in hands, equip directly as two-handed
      const newEquipped = { ...character.equippedItems }
      const newBackpack = [...character.backpack]
      newBackpack[backpackIndex] = null
      newEquipped.rightHand = itemToEquip
      newEquipped.leftHand = null
      onEquippedItemsChange(newEquipped)
      onBackpackChange(newBackpack)
    } else {
      // One-handed: check if target slot is occupied
      if (targetSlotItem) {
        setPendingDrop({
          dragData: { ...dragData, item: itemToEquip },
          targetSlot,
          targetSource: 'equipped',
          existingItem: targetSlotItem,
        })
        setPendingVersatile(null)
        return
      }

      // Target slot is empty, equip directly
      const newEquipped = { ...character.equippedItems }
      const newBackpack = [...character.backpack]
      newBackpack[backpackIndex] = null
      newEquipped[targetSlot as keyof typeof newEquipped] = itemToEquip
      onEquippedItemsChange(newEquipped)
      onBackpackChange(newBackpack)
    }

    setPendingVersatile(null)
  }

  // Handle toggling grip for an equipped versatile weapon
  const handleGripToggle = (toTwoHanded: boolean) => {
    if (!selectedEquippedSlot || !selectedEquippedItem?.versatile) return

    const slot = selectedEquippedSlot
    const otherHand = slot === 'rightHand' ? 'leftHand' : 'rightHand'
    const otherHandItem = character.equippedItems[otherHand as keyof typeof character.equippedItems]

    if (toTwoHanded) {
      // Switching to two-handed
      if (otherHandItem) {
        // There's an item in the other hand, show confirmation modal
        setPendingGripToggle({
          item: selectedEquippedItem,
          otherHandItem,
        })
        setSelectedEquippedSlot(null)
      } else {
        // Other hand is empty, just toggle
        const newEquipped = { ...character.equippedItems }
        newEquipped.rightHand = { ...selectedEquippedItem, usingTwoHanded: true }
        newEquipped.leftHand = null
        onEquippedItemsChange(newEquipped)
        setSelectedEquippedSlot(null)
      }
    } else {
      // Switching to one-handed, just toggle
      const newEquipped = { ...character.equippedItems }
      newEquipped[slot as keyof typeof newEquipped] = { ...selectedEquippedItem, usingTwoHanded: false }
      onEquippedItemsChange(newEquipped)
      setSelectedEquippedSlot(null)
    }
  }

  // Handle pending grip toggle decision (store or drop other hand item)
  const handleGripToggleDecision = (decision: 'backpack' | 'ground') => {
    if (!pendingGripToggle) return

    const { item, otherHandItem } = pendingGripToggle
    const newEquipped = { ...character.equippedItems }

    // Update the versatile weapon to use two-handed
    newEquipped.rightHand = { ...item, usingTwoHanded: true }
    newEquipped.leftHand = null

    if (decision === 'backpack') {
      // Move other hand item to backpack
      const newBackpack = [...character.backpack]
      const emptyIndex = newBackpack.findIndex(i => !i)
      if (emptyIndex >= 0) {
        newBackpack[emptyIndex] = otherHandItem
      } else {
        newBackpack.push(otherHandItem)
      }
      onBackpackChange(newBackpack)
    }
    // If 'ground', just don't add to backpack (item is dropped)

    onEquippedItemsChange(newEquipped)
    setPendingGripToggle(null)
  }

  const renderEquippedItem = (item: EquipmentItem | null, slotName: string, slotKey: string) => {
    const isDragging = draggedItem?.sourceSlot === slotKey
    const canDrop = draggedItem && canEquipInSlot(draggedItem.item, slotKey)

    if (!item) {
      return (
        <div
          onDragOver={(e) => {
            if (canDrop) {
              e.preventDefault()
            }
          }}
          onDrop={() => handleDrop(slotKey, 'equipped')}
          className={`bg-card-muted border-2 border-dashed rounded p-2 text-center text-xs text-muted italic min-h-[60px] flex items-center justify-center transition-colors ${
            canDrop ? 'border-accent bg-accent/10' : 'border-stroke'
          }`}
        >
          {slotName}
        </div>
      )
    }

    return (
      <div
        draggable
        onDragStart={() => { dragStartedRef.current = true; handleDragStart(item, 'equipped', slotKey) }}
        onDragEnd={handleDragEnd}
        onClick={() => { if (dragStartedRef.current) { dragStartedRef.current = false; return } setSelectedEquippedSlot(slotKey) }}
        onKeyDown={(e) => { if (e.key === 'Enter') setSelectedEquippedSlot(slotKey) }}
        role="button"
        tabIndex={0}
        onDragOver={(e) => {
          if (canDrop) {
            e.preventDefault()
          }
        }}
        onDrop={() => handleDrop(slotKey, 'equipped')}
        className={`bg-card-muted border border-stroke rounded p-2 cursor-move hover:border-accent transition-colors ${
          isDragging ? 'opacity-50' : ''
        } ${canDrop ? 'border-accent' : ''}`}
      >
        <div className="text-xs text-muted mb-1">{slotName}</div>
        <div className="font-semibold text-sm truncate" title={item.name}>
          {item.name}
        </div>
        {item.quantity && item.quantity > 1 && (
          <div className="text-xs text-muted">×{item.quantity}</div>
        )}
      </div>
    )
  }

  const selectedBackpackItem = selectedBackpackIndex !== null ? character.backpack[selectedBackpackIndex] : null
  const hasBackpackConsumable = selectedBackpackItem?.effects?.some(e => e.type === 'consumable') ?? false

  const selectedEquippedItem = selectedEquippedSlot ? character.equippedItems[selectedEquippedSlot as keyof typeof character.equippedItems] : null
  const hasEquippedConsumable = selectedEquippedItem?.effects?.some(e => e.type === 'consumable') ?? false
  const desModifier = character.attributes.find(a => a.label === 'DES')?.modifier || 0
  const backpackSwapCount = Math.floor((desModifier + 2 + 2 + 3) / 2)
  const backpackSwapOptions = character.backpack
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item !== null)
    .slice(0, backpackSwapCount)

  const handleEquippedSwap = (targetSlot: string, targetSource: 'equipped' | 'backpack', targetIndex?: number) => {
    if (!selectedEquippedSlot) return

    const actionCost = targetSource === 'backpack' || !QUICK_ACCESS_SLOTS.includes(selectedEquippedSlot) || !QUICK_ACCESS_SLOTS.includes(targetSlot)
      ? 'standard'
      : 'free'
    const targetLabel = targetSource === 'backpack' ? 'item da mochila' : SLOT_LABELS[targetSlot] || targetSlot
    const description = `Trocar ${SLOT_LABELS[selectedEquippedSlot]} com ${targetLabel}`

    onCombatAction(description, actionCost, () => {
      const newEquipped = { ...character.equippedItems }
      if (targetSource === 'equipped') {
        const sourceItem = newEquipped[selectedEquippedSlot as keyof typeof newEquipped]
        const targetItem = newEquipped[targetSlot as keyof typeof newEquipped]
        newEquipped[selectedEquippedSlot as keyof typeof newEquipped] = targetItem
        newEquipped[targetSlot as keyof typeof newEquipped] = sourceItem
        onEquippedItemsChange(newEquipped)
      } else if (targetSource === 'backpack' && targetIndex !== undefined) {
        const newBackpack = [...character.backpack]
        const sourceItem = newEquipped[selectedEquippedSlot as keyof typeof newEquipped]
        newEquipped[selectedEquippedSlot as keyof typeof newEquipped] = newBackpack[targetIndex]
        newBackpack[targetIndex] = sourceItem
        onEquippedItemsChange(newEquipped)
        onBackpackChange(newBackpack)
      }
      setSelectedEquippedSlot(null)
    })
  }

  return (
    <div className="flex flex-col md:grid md:grid-cols-2 gap-4 h-full overflow-hidden">
      {/* LEFT COLUMN */}
      <div className="space-y-4 overflow-y-auto" style={{ maxHeight: '100%' }}>
        {/* Carry Weight Card */}
        <Card>
          <div className="flex items-center justify-between mb-2">
            <Tooltip content={`Máximo: 10 + (2 × FOR ${forModifier >= 0 ? '+' : ''}${forModifier}) = ${maxCarrySpaces} espaços`} className="cursor-help">
              <h3 className="text-lg font-bold">Capacidade de Carga <span className="opacity-50 text-sm">?</span></h3>
            </Tooltip>
            <div className="text-sm">
              <span className={`font-bold ${isEncumbered ? 'text-red-500' : isOverloaded ? 'text-yellow-500' : ''}`}>
                {totalSpaces}
              </span>
              <span className="text-muted"> / {maxCarrySpaces}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-card-muted rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all ${
                isEncumbered ? 'bg-red-500' :
                isOverloaded ? 'bg-yellow-500' :
                'bg-accent'
              }`}
              style={{ width: `${Math.min((totalSpaces / maxCarrySpaces) * 100, 100)}%` }}
            />
          </div>

          {isEncumbered && (
            <div className="text-xs text-red-500 font-semibold">
              ⚠ Sobrecarga extrema!
            </div>
          )}
          {isOverloaded && !isEncumbered && (
            <div className="text-xs text-yellow-500 font-semibold">
              ⚠ Sobrecarregado! –5 armadura, –3m deslocamento
            </div>
          )}

          <div className="text-xs text-muted mt-2">
            Equipado: {equippedSpaces} | Mochila: {backpackSpaces}
          </div>
        </Card>

        {/* Equipped Items */}
        <Card>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold">Itens Equipados</h3>
            <div className="text-xs text-muted">{equippedSpaces} espaços</div>
          </div>

          <div className="space-y-3">
            {/* Hands */}
            <div>
              <div className="text-sm font-semibold text-muted mb-1">Mãos</div>
              {(character.equippedItems.rightHand?.twoHanded || character.equippedItems.rightHand?.usingTwoHanded) ? (
                // Two-handed weapon - merged slot
                <div
                  draggable
                  onDragStart={() => { dragStartedRef.current = true; handleDragStart(character.equippedItems.rightHand!, 'equipped', 'rightHand') }}
                  onDragEnd={handleDragEnd}
                  onClick={() => { if (dragStartedRef.current) { dragStartedRef.current = false; return } setSelectedEquippedSlot('rightHand') }}
                  onKeyDown={(e) => { if (e.key === 'Enter') setSelectedEquippedSlot('rightHand') }}
                  role="button"
                  tabIndex={0}
                  className={`bg-card-muted border border-stroke rounded p-2 cursor-move hover:border-accent transition-colors ${
                    draggedItem?.sourceSlot === 'rightHand' ? 'opacity-50' : ''
                  }`}
                >
                  <div className="text-xs text-muted mb-1">Duas Mãos</div>
                  <div className="font-semibold text-sm truncate" title={character.equippedItems.rightHand.name}>
                    {character.equippedItems.rightHand.name}
                  </div>
                  {character.equippedItems.rightHand.quantity && character.equippedItems.rightHand.quantity > 1 && (
                    <div className="text-xs text-muted">×{character.equippedItems.rightHand.quantity}</div>
                  )}
                </div>
              ) : (
                // Normal two separate slots
                <div className="grid grid-cols-2 gap-2">
                  {renderEquippedItem(character.equippedItems.rightHand, 'Mão Direita', 'rightHand')}
                  {renderEquippedItem(character.equippedItems.leftHand, 'Mão Esquerda', 'leftHand')}
                </div>
              )}
            </div>

            {/* Quick Draw */}
            <div>
              <div className="text-sm font-semibold text-muted mb-1">Saque Rápido</div>
              <div className="grid grid-cols-2 gap-2">
                {renderEquippedItem(character.equippedItems.quickDraw1, 'SR 1', 'quickDraw1')}
                {renderEquippedItem(character.equippedItems.quickDraw2, 'SR 2', 'quickDraw2')}
              </div>
            </div>

            {/* Utility Slots */}
            <div>
              <div className="text-sm font-semibold text-muted mb-1">Slots de Utilidade</div>
              <div className="grid grid-cols-2 gap-2">
                {renderEquippedItem(character.equippedItems.slot1, 'Slot 1', 'slot1')}
                {renderEquippedItem(character.equippedItems.slot2, 'Slot 2', 'slot2')}
                {renderEquippedItem(character.equippedItems.slot3, 'Slot 3', 'slot3')}
                {renderEquippedItem(character.equippedItems.slot4, 'Slot 4', 'slot4')}
              </div>
            </div>

          </div>
        </Card>
      </div>

      {/* RIGHT COLUMN - Backpack */}
      <div className="flex flex-col overflow-hidden" style={{ maxHeight: '100%' }}>
        <Card className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">Mochila</h3>
              <button
                onClick={() => setBackpackTypeModalOpen(true)}
                className="text-[10px] px-1.5 py-0.5 bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                title="Alterar tipo de mochila"
              >
                {BACKPACK_TYPES[backpackType].name}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-muted">{backpackSpaces} / {BACKPACK_TYPES[backpackType].slots} slots</div>
              <button
                onClick={() => setAddItemModalOpen(true)}
                className="text-xs px-2 py-1 bg-accent text-card rounded hover:bg-accent-hover transition-colors"
              >
                + Item
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 content-start overflow-y-auto flex-1 pb-2" style={{ minHeight: 0 }}>
            {/* Gold Coins Card */}
            {character.currencies.to > 0 && (
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  setEditCurrencyValue(character.currencies.to.toString())
                  setEditingCurrency('to')
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') { setEditCurrencyValue(character.currencies.to.toString()); setEditingCurrency('to') } }}
                className="bg-card-muted border border-stroke rounded p-1.5 h-[70px] flex flex-col hover:border-accent transition-colors cursor-pointer"
              >
                <div className="font-semibold text-xs text-yellow-600">Ouro (TO)</div>
                <div className="text-lg font-bold text-yellow-600 mt-0.5">{character.currencies.to}</div>
                <div className="text-[10px] text-muted mt-auto">
                  {toSpaces} esp.
                </div>
              </div>
            )}

            {/* Silver Coins Card */}
            {character.currencies.tp > 0 && (
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  setEditCurrencyValue(character.currencies.tp.toString())
                  setEditingCurrency('tp')
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') { setEditCurrencyValue(character.currencies.tp.toString()); setEditingCurrency('tp') } }}
                className="bg-card-muted border border-stroke rounded p-1.5 h-[70px] flex flex-col hover:border-accent transition-colors cursor-pointer"
              >
                <div className="font-semibold text-xs text-gray-300">Prata (TP)</div>
                <div className="text-lg font-bold text-gray-300 mt-0.5">{character.currencies.tp}</div>
                <div className="text-[10px] text-muted mt-auto">
                  {tpSpaces} esp.
                </div>
              </div>
            )}

            {/* Copper Coins Card */}
            {character.currencies.tc > 0 && (
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  setEditCurrencyValue(character.currencies.tc.toString())
                  setEditingCurrency('tc')
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') { setEditCurrencyValue(character.currencies.tc.toString()); setEditingCurrency('tc') } }}
                className="bg-card-muted border border-stroke rounded p-1.5 h-[70px] flex flex-col hover:border-accent transition-colors cursor-pointer"
              >
                <div className="font-semibold text-xs text-orange-700">Cobre (TC)</div>
                <div className="text-lg font-bold text-orange-700 mt-0.5">{character.currencies.tc}</div>
                <div className="text-[10px] text-muted mt-auto">
                  {tcSpaces} esp.
                </div>
              </div>
            )}

            {character.backpack
              .map((item, index) => ({ item, originalIndex: index }))
              .filter(({ item }) => item !== null)
              .map(({ item, originalIndex }) => {
                const slotKey = `backpack-${originalIndex}`
                const isDragging = draggedItem?.sourceSlot === slotKey
                const canDrop = draggedItem !== null

                return (
                  <div
                    key={originalIndex}
                    draggable
                    onDragStart={() => { dragStartedRef.current = true; handleDragStart(item!, 'backpack', slotKey) }}
                    onDragEnd={handleDragEnd}
                    onClick={() => { if (dragStartedRef.current) { dragStartedRef.current = false; return } setSelectedBackpackIndex(originalIndex) }}
                    onKeyDown={(e) => { if (e.key === 'Enter') setSelectedBackpackIndex(originalIndex) }}
                    role="button"
                    tabIndex={0}
                    onDragOver={(e) => {
                      if (canDrop) {
                        e.preventDefault()
                      }
                    }}
                    onDrop={() => handleDrop(slotKey, 'backpack')}
                    className={`bg-card-muted border border-stroke rounded p-1.5 h-[70px] flex flex-col hover:bg-card transition-colors relative group cursor-move hover:border-accent ${
                      isDragging ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="font-semibold text-xs truncate" title={item!.name}>{item!.name}</div>
                    <div className="flex flex-wrap gap-x-1.5 mt-0.5 text-[10px] text-muted">
                      {item!.quantity && item!.quantity > 1 && (
                        <span>×{item!.quantity}</span>
                      )}
                      {item!.spaces && (
                        <span>{item!.spaces * (item!.quantity || 1)} esp.</span>
                      )}
                      {item!.price && (
                        <span>{item!.price} TP</span>
                      )}
                    </div>
                    <button
                      className="absolute top-1 right-1 text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity bg-card rounded px-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        const newBackpack = [...character.backpack]
                        newBackpack[originalIndex] = null
                        onBackpackChange(newBackpack)
                      }}
                    >
                      ×
                    </button>
                  </div>
                )
              })}
            {character.backpack.every(item => !item) && !draggedItem && (
              <div className="col-span-3 text-center py-12 text-muted italic text-sm">
                Nenhum item na mochila
              </div>
            )}
            {/* Drop zone for adding items to backpack */}
            {draggedItem && draggedItem.source === 'equipped' && (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (!draggedItem) return
                  const { item, sourceSlot } = draggedItem

                  // Find first empty slot in backpack
                  const newBackpack = [...character.backpack]
                  const emptyIndex = newBackpack.findIndex(i => !i)

                  if (emptyIndex >= 0) {
                    newBackpack[emptyIndex] = item
                  } else {
                    newBackpack.push(item)
                  }

                  // Clear the equipped slot
                  const newEquipped = { ...character.equippedItems }
                  newEquipped[sourceSlot as keyof typeof newEquipped] = null

                  onBackpackChange(newBackpack)
                  onEquippedItemsChange(newEquipped)
                  setDraggedItem(null)
                }}
                className="col-span-3 border-2 border-dashed border-accent bg-accent/10 rounded p-4 text-center text-sm text-accent flex items-center justify-center min-h-[70px]"
              >
                Soltar aqui para guardar na mochila
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Backpack Type Modal */}
      <Modal
        isOpen={backpackTypeModalOpen}
        onClose={() => setBackpackTypeModalOpen(false)}
        title="Tipo de Mochila"
      >
        <div className="space-y-3">
          {(Object.keys(BACKPACK_TYPES) as BackpackType[]).map((type) => (
            <button
              key={type}
              onClick={() => {
                setBackpackType(type)
                setBackpackTypeModalOpen(false)
              }}
              className={`w-full p-3 rounded border-2 transition-all text-left ${
                backpackType === type
                  ? 'border-accent bg-accent/10'
                  : 'border-stroke hover:border-accent/50'
              }`}
            >
              <div className="font-semibold">{BACKPACK_TYPES[type].name}</div>
              <div className="text-sm text-muted">{BACKPACK_TYPES[type].description}</div>
            </button>
          ))}
        </div>
      </Modal>

      {/* Backpack Item Detail Modal */}
      <Modal
        isOpen={selectedBackpackIndex !== null && selectedBackpackItem !== null}
        onClose={() => setSelectedBackpackIndex(null)}
        title={selectedBackpackItem?.name || 'Item'}
      >
        {selectedBackpackItem && (
          <div className="space-y-4">
            <div>
              {selectedBackpackItem.description && (
                <p className="text-sm text-muted">{selectedBackpackItem.description}</p>
              )}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {selectedBackpackItem.category && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-card-muted rounded capitalize">{selectedBackpackItem.category}</span>
                )}
                {selectedBackpackItem.weight && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-card-muted rounded">{selectedBackpackItem.weight} kg</span>
                )}
                {selectedBackpackItem.spaces && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-card-muted rounded">{selectedBackpackItem.spaces} esp.</span>
                )}
                {selectedBackpackItem.price && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-card-muted rounded">{selectedBackpackItem.price} TP</span>
                )}
                {selectedBackpackItem.quantity && selectedBackpackItem.quantity > 1 && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-card-muted rounded">×{selectedBackpackItem.quantity}</span>
                )}
              </div>
            </div>

            {selectedBackpackItem.effects && selectedBackpackItem.effects.length > 0 && (
              <div>
                <div className="text-sm font-semibold mb-1.5">Efeitos</div>
                <div className="space-y-1.5">
                  {selectedBackpackItem.effects.map((effect, idx) => (
                    <div key={idx} className="text-xs p-2 bg-card-muted rounded">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] px-1 py-0.5 rounded capitalize ${
                          effect.type === 'passive' ? 'bg-accent/20 text-accent' :
                          effect.type === 'consumable' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>{effect.type}</span>
                        <span className="font-semibold">{effect.name}</span>
                      </div>
                      <div className="text-muted mt-0.5">{effect.description}</div>
                      {effect.activeAbility && (
                        <div className="text-[10px] text-muted mt-0.5">
                          Ação: {effect.activeAbility.actionType}
                          {effect.activeAbility.cost?.pm && ` • ${effect.activeAbility.cost.pm} PM`}
                          {effect.activeAbility.cost?.pv && ` • ${effect.activeAbility.cost.pv} PV`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hasBackpackConsumable && (
              <button
                onClick={() => {
                  const consumableEffect = selectedBackpackItem!.effects?.find(e => e.type === 'consumable')
                  const actionCost = consumableEffect?.activeAbility?.actionType || 'standard'
                  onCombatAction(`Usar consumível: ${selectedBackpackItem!.name}`, actionCost, () => {
                    onUseConsumable(selectedBackpackItem, 'backpack', String(selectedBackpackIndex))
                    setSelectedBackpackIndex(null)
                  })
                }}
                className="w-full py-2 bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded hover:bg-orange-500/30 transition-colors text-sm font-semibold"
              >
                Usar
              </button>
            )}
          </div>
        )}
      </Modal>

      {/* Equipped Item Detail Modal */}
      <Modal
        isOpen={selectedEquippedSlot !== null}
        onClose={() => setSelectedEquippedSlot(null)}
        title={selectedEquippedItem?.name || SLOT_LABELS[selectedEquippedSlot || ''] || 'Slot'}
      >
        {selectedEquippedItem ? (
          <div className="space-y-4">
            <div>
              {selectedEquippedItem.description && (
                <p className="text-sm text-muted">{selectedEquippedItem.description}</p>
              )}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {selectedEquippedItem.category && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-card-muted rounded capitalize">{selectedEquippedItem.category}</span>
                )}
                {selectedEquippedItem.weight && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-card-muted rounded">{selectedEquippedItem.weight} kg</span>
                )}
                {selectedEquippedItem.spaces && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-card-muted rounded">{selectedEquippedItem.spaces} esp.</span>
                )}
                {selectedEquippedItem.price && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-card-muted rounded">{selectedEquippedItem.price} TP</span>
                )}
              </div>
            </div>

            {selectedEquippedItem.effects && selectedEquippedItem.effects.length > 0 && (
              <div>
                <div className="text-sm font-semibold mb-1.5">Efeitos</div>
                <div className="space-y-1.5">
                  {selectedEquippedItem.effects.map((effect, idx) => (
                    <div key={idx} className="text-xs p-2 bg-card-muted rounded">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] px-1 py-0.5 rounded capitalize ${
                          effect.type === 'passive' ? 'bg-accent/20 text-accent' :
                          effect.type === 'consumable' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>{effect.type}</span>
                        <span className="font-semibold">{effect.name}</span>
                      </div>
                      <div className="text-muted mt-0.5">{effect.description}</div>
                      {effect.activeAbility && (
                        <div className="text-[10px] text-muted mt-0.5">
                          Ação: {effect.activeAbility.actionType}
                          {effect.activeAbility.cost?.pm && ` • ${effect.activeAbility.cost.pm} PM`}
                          {effect.activeAbility.cost?.pv && ` • ${effect.activeAbility.cost.pv} PV`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hasEquippedConsumable && (
              <button
                onClick={() => {
                  const consumableEffect = selectedEquippedItem!.effects?.find(e => e.type === 'consumable')
                  const actionCost = consumableEffect?.activeAbility?.actionType || 'standard'
                  onCombatAction(`Usar consumível: ${selectedEquippedItem!.name}`, actionCost, () => {
                    onUseConsumable(selectedEquippedItem!, 'equipped', selectedEquippedSlot!)
                    setSelectedEquippedSlot(null)
                  })
                }}
                className="w-full py-2 bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded hover:bg-orange-500/30 transition-colors text-sm font-semibold"
              >
                Usar
              </button>
            )}

            {/* Grip toggle for versatile weapons in hand slots */}
            {selectedEquippedItem.versatile && (selectedEquippedSlot === 'rightHand' || selectedEquippedSlot === 'leftHand') && (
              <div className="pt-3 border-t border-stroke">
                <div className="text-sm font-semibold mb-1.5">Empunhamento</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleGripToggle(false)}
                    className={`flex-1 py-2 rounded text-xs font-semibold transition-colors ${
                      !selectedEquippedItem.usingTwoHanded
                        ? 'bg-accent text-card'
                        : 'bg-card-muted border border-stroke hover:border-accent'
                    }`}
                  >
                    Uma Mão
                  </button>
                  <button
                    onClick={() => handleGripToggle(true)}
                    className={`flex-1 py-2 rounded text-xs font-semibold transition-colors ${
                      selectedEquippedItem.usingTwoHanded
                        ? 'bg-accent text-card'
                        : 'bg-card-muted border border-stroke hover:border-accent'
                    }`}
                  >
                    Duas Mãos
                  </button>
                </div>
              </div>
            )}

            <div>
              <div className="text-sm font-semibold mb-1.5">Trocar com</div>
              <div className="space-y-1.5">
                {/* Swap with other hand - not available for two-handed items */}
                {(selectedEquippedSlot === 'rightHand' || selectedEquippedSlot === 'leftHand') && !selectedEquippedItem?.twoHanded && (
                  <button
                    onClick={() => handleEquippedSwap(
                      selectedEquippedSlot === 'rightHand' ? 'leftHand' : 'rightHand',
                      'equipped'
                    )}
                    className="w-full text-left text-xs p-2 bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                  >
                    <span className="font-semibold">{selectedEquippedSlot === 'rightHand' ? 'Mão Esquerda' : 'Mão Direita'}</span>
                    <span className="text-muted ml-1.5">
                      {character.equippedItems[selectedEquippedSlot === 'rightHand' ? 'leftHand' : 'rightHand']?.name || 'vazio'}
                    </span>
                  </button>
                )}

                {/* Swap with hands (when quick draw is selected) */}
                {(selectedEquippedSlot === 'quickDraw1' || selectedEquippedSlot === 'quickDraw2') && (
                  <>
                    <button
                      onClick={() => handleEquippedSwap('rightHand', 'equipped')}
                      className="w-full text-left text-xs p-2 bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                    >
                      <span className="font-semibold">Mão Direita</span>
                      <span className="text-muted ml-1.5">{character.equippedItems.rightHand?.name || 'vazio'}</span>
                    </button>
                    <button
                      onClick={() => handleEquippedSwap('leftHand', 'equipped')}
                      className="w-full text-left text-xs p-2 bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                    >
                      <span className="font-semibold">Mão Esquerda</span>
                      <span className="text-muted ml-1.5">{character.equippedItems.leftHand?.name || 'vazio'}</span>
                    </button>
                  </>
                )}

                {/* Quick draw */}
                {(['quickDraw1', 'quickDraw2'] as const)
                  .filter(s => s !== selectedEquippedSlot)
                  .map((qd) => (
                    <button
                      key={qd}
                      onClick={() => handleEquippedSwap(qd, 'equipped')}
                      className="w-full text-left text-xs p-2 bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                    >
                      <span className="font-semibold">{qd === 'quickDraw1' ? 'Saque Rápido 1' : 'Saque Rápido 2'}</span>
                      <span className="text-muted ml-1.5">{character.equippedItems[qd]?.name || 'vazio'}</span>
                    </button>
                  ))}

                {/* First N backpack items */}
                {backpackSwapOptions.map(({ item, index }) => (
                  <button
                    key={index}
                    onClick={() => handleEquippedSwap('', 'backpack', index)}
                    className="w-full text-left text-xs p-2 bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                  >
                    <span className="font-semibold">Mochila</span>
                    <span className="text-muted ml-1.5">{item?.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Unequip options */}
            <div className="pt-3 border-t border-stroke">
              <div className="text-sm font-semibold mb-1.5">Desequipar</div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onCombatAction(`Guardar ${selectedEquippedItem!.name} na mochila`, 'movement', () => {
                      // Send to backpack
                      const newBackpack = [...character.backpack]
                      const emptyIndex = newBackpack.findIndex(item => !item)
                      if (emptyIndex >= 0) {
                        newBackpack[emptyIndex] = selectedEquippedItem
                      } else {
                        newBackpack.push(selectedEquippedItem)
                      }
                      onBackpackChange(newBackpack)

                      // Clear equipped slot(s)
                      const newEquipped = { ...character.equippedItems }
                      if (selectedEquippedItem?.twoHanded) {
                        // Two-handed: clear both hands
                        newEquipped.rightHand = null
                        newEquipped.leftHand = null
                      } else {
                        newEquipped[selectedEquippedSlot as keyof typeof newEquipped] = null
                      }
                      onEquippedItemsChange(newEquipped)
                      setSelectedEquippedSlot(null)
                    })
                  }}
                  className="flex-1 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded hover:bg-blue-500/30 transition-colors text-xs font-semibold"
                >
                  Guardar na Mochila
                </button>
                <button
                  onClick={() => {
                    onCombatAction(`Soltar ${selectedEquippedItem!.name} no chão`, 'free', () => {
                      // Drop item (remove completely)
                      const newEquipped = { ...character.equippedItems }
                      if (selectedEquippedItem?.twoHanded) {
                        // Two-handed: clear both hands
                        newEquipped.rightHand = null
                        newEquipped.leftHand = null
                      } else {
                        newEquipped[selectedEquippedSlot as keyof typeof newEquipped] = null
                      }
                      onEquippedItemsChange(newEquipped)
                      setSelectedEquippedSlot(null)
                    })
                  }}
                  className="flex-1 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded hover:bg-red-500/30 transition-colors text-xs font-semibold"
                >
                  Soltar no Chão
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted text-center py-4">Este slot está vazio</p>
        )}
      </Modal>

      {/* Pending Drop Modal - when dragging to an occupied slot */}
      <Modal
        isOpen={pendingDrop !== null}
        onClose={() => setPendingDrop(null)}
        title={pendingDrop?.secondHandItem ? "Slots Ocupados" : "Slot Ocupado"}
      >
        {pendingDrop && pendingDrop.secondHandItem ? (
          // Two-handed weapon with both hands occupied
          <div className="space-y-4">
            <p className="text-sm">
              Para equipar <strong>{pendingDrop.dragData.item.name}</strong> (duas mãos),
              você precisa liberar ambas as mãos.
            </p>
            <p className="text-sm text-muted">
              O que deseja fazer com cada item?
            </p>

            {/* Right Hand Item */}
            {character.equippedItems.rightHand && (
              <div className="p-2 bg-card-muted border border-stroke rounded">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs text-muted">Mão Direita:</span>
                    <span className="ml-1.5 font-semibold text-sm">{character.equippedItems.rightHand.name}</span>
                  </div>
                  {pendingDrop.rightHandDecision && (
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      pendingDrop.rightHandDecision === 'backpack'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {pendingDrop.rightHandDecision === 'backpack' ? 'Mochila' : 'Chão'}
                    </span>
                  )}
                </div>
                {!pendingDrop.rightHandDecision && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTwoHandedItemDecision('right', 'backpack')}
                      className="flex-1 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded hover:bg-blue-500/30 transition-colors text-xs font-semibold"
                    >
                      Guardar na Mochila
                    </button>
                    <button
                      onClick={() => handleTwoHandedItemDecision('right', 'ground')}
                      className="flex-1 py-1.5 bg-red-500/20 border border-red-500/30 text-red-400 rounded hover:bg-red-500/30 transition-colors text-xs font-semibold"
                    >
                      Soltar no Chão
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Left Hand Item */}
            {character.equippedItems.leftHand && (
              <div className="p-2 bg-card-muted border border-stroke rounded">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs text-muted">Mão Esquerda:</span>
                    <span className="ml-1.5 font-semibold text-sm">{character.equippedItems.leftHand.name}</span>
                  </div>
                  {pendingDrop.leftHandDecision && (
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      pendingDrop.leftHandDecision === 'backpack'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {pendingDrop.leftHandDecision === 'backpack' ? 'Mochila' : 'Chão'}
                    </span>
                  )}
                </div>
                {!pendingDrop.leftHandDecision && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTwoHandedItemDecision('left', 'backpack')}
                      className="flex-1 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded hover:bg-blue-500/30 transition-colors text-xs font-semibold"
                    >
                      Guardar na Mochila
                    </button>
                    <button
                      onClick={() => handleTwoHandedItemDecision('left', 'ground')}
                      className="flex-1 py-1.5 bg-red-500/20 border border-red-500/30 text-red-400 rounded hover:bg-red-500/30 transition-colors text-xs font-semibold"
                    >
                      Soltar no Chão
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : pendingDrop && (
          // Single slot occupied (original behavior)
          <div className="space-y-4">
            <p className="text-sm">
              O slot <strong>{SLOT_LABELS[pendingDrop.targetSlot]}</strong> já contém{' '}
              <strong>{pendingDrop.existingItem.name}</strong>.
            </p>
            <p className="text-sm text-muted">
              O que deseja fazer com o item existente?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handlePendingDropToBackpack}
                className="flex-1 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded hover:bg-blue-500/30 transition-colors text-xs font-semibold"
              >
                Guardar na Mochila
              </button>
              <button
                onClick={handlePendingDropToGround}
                className="flex-1 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded hover:bg-red-500/30 transition-colors text-xs font-semibold"
              >
                Soltar no Chão
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Versatile Weapon Choice Modal */}
      <Modal
        isOpen={pendingVersatile !== null}
        onClose={() => setPendingVersatile(null)}
        title="Escolha o Empunhamento"
      >
        {pendingVersatile && (
          <div className="space-y-4">
            <p className="text-sm">
              <strong>{pendingVersatile.dragData.item.name}</strong> é uma arma versátil.
              Como deseja empunhá-la?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleVersatileChoice(false)}
                className="flex-1 py-3 bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
              >
                <div className="font-semibold text-sm">Uma Mão</div>
                <div className="text-xs text-muted mt-1">Mão livre para escudo ou outro item</div>
              </button>
              <button
                onClick={() => handleVersatileChoice(true)}
                className="flex-1 py-3 bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
              >
                <div className="font-semibold text-sm">Duas Mãos</div>
                <div className="text-xs text-muted mt-1">+2 de dano (bônus de FOR × 1.5)</div>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Pending Grip Toggle Modal - when switching to two-handed with item in other hand */}
      <Modal
        isOpen={pendingGripToggle !== null}
        onClose={() => setPendingGripToggle(null)}
        title="Mudar Empunhamento"
      >
        {pendingGripToggle && (
          <div className="space-y-4">
            <p className="text-sm">
              Para usar <strong>{pendingGripToggle.item.name}</strong> com duas mãos,
              você precisa liberar a outra mão.
            </p>
            <p className="text-sm text-muted">
              O que deseja fazer com <strong>{pendingGripToggle.otherHandItem.name}</strong>?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleGripToggleDecision('backpack')}
                className="flex-1 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded hover:bg-blue-500/30 transition-colors text-xs font-semibold"
              >
                Guardar na Mochila
              </button>
              <button
                onClick={() => handleGripToggleDecision('ground')}
                className="flex-1 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded hover:bg-red-500/30 transition-colors text-xs font-semibold"
              >
                Soltar no Chão
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={addItemModalOpen}
        onClose={() => setAddItemModalOpen(false)}
        onAddItem={(newItem) => {
          // Add to first available slot in backpack
          const newBackpack = [...character.backpack]
          const emptyIndex = newBackpack.findIndex(item => !item)

          if (emptyIndex >= 0) {
            newBackpack[emptyIndex] = newItem
          } else {
            // Add to end if no empty slots
            newBackpack.push(newItem)
          }

          onBackpackChange(newBackpack)
        }}
      />

      {/* Currency Edit Modal - Single Currency */}
      <Modal
        isOpen={editingCurrency !== null}
        onClose={() => setEditingCurrency(null)}
        title={
          editingCurrency === 'to' ? 'Editar Ouro (TO)' :
          editingCurrency === 'tp' ? 'Editar Prata (TP)' :
          'Editar Cobre (TC)'
        }
      >
        {editingCurrency && (
          <div className="space-y-4">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setEditCurrencyValue(v => Math.max(0, parseInt(v) - 100).toString())}
                className="px-2 py-1.5 text-xs bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
              >
                -100
              </button>
              <button
                onClick={() => setEditCurrencyValue(v => Math.max(0, parseInt(v) - 10).toString())}
                className="px-2 py-1.5 text-xs bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
              >
                -10
              </button>
              <button
                onClick={() => setEditCurrencyValue(v => Math.max(0, parseInt(v) - 1).toString())}
                className="px-2 py-1.5 text-xs bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
              >
                -1
              </button>
              <input
                type="number"
                value={editCurrencyValue}
                onChange={(e) => setEditCurrencyValue(e.target.value)}
                className={`flex-1 px-2 py-1.5 text-sm bg-card-muted border border-stroke rounded text-center font-bold ${
                  editingCurrency === 'to' ? 'text-yellow-600' :
                  editingCurrency === 'tp' ? 'text-gray-300' :
                  'text-orange-700'
                }`}
                min="0"
              />
              <button
                onClick={() => setEditCurrencyValue(v => (parseInt(v || '0') + 1).toString())}
                className="px-2 py-1.5 text-xs bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
              >
                +1
              </button>
              <button
                onClick={() => setEditCurrencyValue(v => (parseInt(v || '0') + 10).toString())}
                className="px-2 py-1.5 text-xs bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
              >
                +10
              </button>
              <button
                onClick={() => setEditCurrencyValue(v => (parseInt(v || '0') + 100).toString())}
                className="px-2 py-1.5 text-xs bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
              >
                +100
              </button>
            </div>

            {/* Space info */}
            <div className="text-center text-xs text-muted">
              Espaço ocupado: {Math.ceil((parseInt(editCurrencyValue) || 0) / 1000)} espaço(s)
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEditingCurrency(null)}
                className="flex-1 px-3 py-1.5 text-sm bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const newValue = parseInt(editCurrencyValue) || 0
                  onCurrenciesChange({
                    ...character.currencies,
                    [editingCurrency]: newValue,
                  })
                  setEditingCurrency(null)
                }}
                className="flex-1 px-3 py-1.5 text-sm bg-accent text-card rounded hover:bg-accent-hover transition-colors font-semibold"
              >
                Salvar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
