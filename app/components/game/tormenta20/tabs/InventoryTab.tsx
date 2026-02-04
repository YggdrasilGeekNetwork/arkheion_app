import { useState, useRef } from 'react'
import type { Character, EquipmentItem } from '~/types/character'
import Card from '~/components/ui/Card'
import Modal from '~/components/ui/Modal'
import Tooltip from '~/components/ui/Tooltip'
import AddItemModal from '../AddItemModal'

type InventoryTabProps = {
  character: Character
  onBackpackChange: (newBackpack: typeof character.backpack) => void
  onEquippedItemsChange: (newItems: typeof character.equippedItems) => void
  onCurrenciesChange: (newCurrencies: typeof character.currencies) => void
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

  // Hands slots - only weapons and some equipment
  if (slotName === 'rightHand' || slotName === 'leftHand') {
    return category === 'weapon' || category === 'equipment' || category === 'tool'
  }

  // Quick draw slots - small items only
  if (slotName === 'quickDraw1' || slotName === 'quickDraw2') {
    return category === 'weapon' || category === 'alchemical' || category === 'tool'
  }

  // Utility slots - any item except armor
  if (slotName.startsWith('slot')) {
    return category !== 'armor'
  }

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
  const dragStartedRef = useRef(false)

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

  const backpackSpaces = character.backpack
    .reduce((total, item) => total + calculateItemSpaces(item), 0)

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

    // Validate if item can be equipped in this slot
    if (targetSource === 'equipped' && !canEquipInSlot(item, targetSlot)) {
      console.log('Cannot equip this item type in this slot')
      setDraggedItem(null)
      return
    }

    // Handle equipped to equipped
    if (source === 'equipped' && targetSource === 'equipped') {
      const newEquipped = { ...character.equippedItems }
      const targetItem = newEquipped[targetSlot as keyof typeof newEquipped]

      // Swap items
      newEquipped[sourceSlot as keyof typeof newEquipped] = targetItem
      newEquipped[targetSlot as keyof typeof newEquipped] = item

      onEquippedItemsChange(newEquipped)
    }

    // Handle equipped to backpack
    if (source === 'equipped' && targetSource === 'backpack') {
      const backpackIndex = parseInt(targetSlot.replace('backpack-', ''))
      const newEquipped = { ...character.equippedItems }
      const newBackpack = [...character.backpack]

      // Swap items
      const targetItem = newBackpack[backpackIndex]
      newEquipped[sourceSlot as keyof typeof newEquipped] = targetItem
      newBackpack[backpackIndex] = item

      onEquippedItemsChange(newEquipped)
      onBackpackChange(newBackpack)
    }

    // Handle backpack to equipped
    if (source === 'backpack' && targetSource === 'equipped') {
      const backpackIndex = parseInt(sourceSlot.replace('backpack-', ''))
      const newEquipped = { ...character.equippedItems }
      const newBackpack = [...character.backpack]

      // Swap items
      const targetItem = newEquipped[targetSlot as keyof typeof newEquipped]
      newBackpack[backpackIndex] = targetItem
      newEquipped[targetSlot as keyof typeof newEquipped] = item

      onEquippedItemsChange(newEquipped)
      onBackpackChange(newBackpack)
    }

    // Handle backpack to backpack
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
              <div className="grid grid-cols-2 gap-2">
                {renderEquippedItem(character.equippedItems.rightHand, 'Mão Direita', 'rightHand')}
                {renderEquippedItem(character.equippedItems.leftHand, 'Mão Esquerda', 'leftHand')}
              </div>
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
            {character.backpack.every(item => !item) && (
              <div className="col-span-3 text-center py-12 text-muted italic text-sm">
                Nenhum item na mochila
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

            <div>
              <div className="text-sm font-semibold mb-1.5">Trocar com</div>
              <div className="space-y-1.5">
                {/* Swap with other hand */}
                {(selectedEquippedSlot === 'rightHand' || selectedEquippedSlot === 'leftHand') && (
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
          </div>
        ) : (
          <p className="text-sm text-muted text-center py-4">Este slot está vazio</p>
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
    </div>
  )
}
