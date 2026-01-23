import { useState } from 'react'
import Card from './Card'
import Modal from './Modal'
import Tooltip from './Tooltip'

type EquipmentItem = {
  name: string
  description?: string
}

type EquipmentSlot = 'rightHand' | 'leftHand' | 'quickDraw1' | 'quickDraw2' | 'slot1' | 'slot2' | 'slot3' | 'slot4'

type Currencies = {
  tc: number // Tibares de Cobre
  tp: number // Tibares de Prata
  to: number // Tibares de Ouro
}

type EquipmentCardProps = {
  desModifier: number
  equippedItems: {
    rightHand: EquipmentItem | null
    leftHand: EquipmentItem | null
    quickDraw1: EquipmentItem | null
    quickDraw2: EquipmentItem | null
    slot1: EquipmentItem | null
    slot2: EquipmentItem | null
    slot3: EquipmentItem | null
    slot4: EquipmentItem | null
  }
  backpack: (EquipmentItem | null)[]
  currencies: Currencies
  onBackpackChange: (newBackpack: (EquipmentItem | null)[]) => void
  onEquippedItemsChange?: (newEquippedItems: EquipmentCardProps['equippedItems']) => void
  onCurrenciesChange?: (newCurrencies: Currencies) => void
}

const slotLabels: Record<EquipmentSlot, { label: string; tooltip: string }> = {
  rightHand: { label: 'MD', tooltip: 'Mão Direita' },
  leftHand: { label: 'ME', tooltip: 'Mão Esquerda' },
  quickDraw1: { label: 'SR1', tooltip: 'Saque Rápido 1' },
  quickDraw2: { label: 'SR2', tooltip: 'Saque Rápido 2' },
  slot1: { label: 'S1', tooltip: 'Slot 1' },
  slot2: { label: 'S2', tooltip: 'Slot 2' },
  slot3: { label: 'S3', tooltip: 'Slot 3' },
  slot4: { label: 'S4', tooltip: 'Slot 4' },
}

const EquipmentCard = ({ desModifier, equippedItems, backpack, currencies, onBackpackChange, onEquippedItemsChange, onCurrenciesChange }: EquipmentCardProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [editingSlot, setEditingSlot] = useState<EquipmentSlot | null>(null)
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false)
  const [editingCurrencies, setEditingCurrencies] = useState<Currencies>(currencies)
  const quickDrawSlots = Math.max(0, Math.floor(desModifier / 2))

  const handleEquipItem = (item: EquipmentItem | null, backpackIndex: number | null) => {
    if (!editingSlot || !onEquippedItemsChange) return

    const currentItem = equippedItems[editingSlot]
    const newEquippedItems = { ...equippedItems, [editingSlot]: item }

    // If there was an item equipped, add it back to backpack
    if (currentItem && backpackIndex !== null) {
      const newBackpack = [...backpack]
      newBackpack[backpackIndex] = currentItem
      onBackpackChange(newBackpack)
    } else if (backpackIndex !== null) {
      // Remove the item from backpack
      const newBackpack = [...backpack]
      newBackpack[backpackIndex] = null
      onBackpackChange(newBackpack)
    }

    onEquippedItemsChange(newEquippedItems)
    setEditingSlot(null)
  }

  const handleUnequipItem = () => {
    if (!editingSlot || !onEquippedItemsChange) return

    const currentItem = equippedItems[editingSlot]
    if (!currentItem) {
      setEditingSlot(null)
      return
    }

    // Find first empty slot in backpack
    const emptyIndex = backpack.findIndex(item => item === null)
    if (emptyIndex !== -1) {
      const newBackpack = [...backpack]
      newBackpack[emptyIndex] = currentItem
      onBackpackChange(newBackpack)
    }

    const newEquippedItems = { ...equippedItems, [editingSlot]: null }
    onEquippedItemsChange(newEquippedItems)
    setEditingSlot(null)
  }

  const handleOpenCurrencyModal = () => {
    setEditingCurrencies(currencies)
    setIsCurrencyModalOpen(true)
  }

  const handleSaveCurrencies = () => {
    onCurrenciesChange?.(editingCurrencies)
    setIsCurrencyModalOpen(false)
  }

  const handleSwapToHand = (handSlot: 'rightHand' | 'leftHand') => {
    if (!editingSlot || !onEquippedItemsChange) return

    const quickDrawItem = equippedItems[editingSlot]
    const handItem = equippedItems[handSlot]

    const newEquippedItems = {
      ...equippedItems,
      [editingSlot]: handItem,
      [handSlot]: quickDrawItem,
    }

    onEquippedItemsChange(newEquippedItems)
    setEditingSlot(null)
  }

  const renderSlot = (item: EquipmentItem | null, slotKey: EquipmentSlot) => {
    const { label, tooltip } = slotLabels[slotKey]

    return (
      <Tooltip content={tooltip} className="">
        <div
          className="bg-card-muted border border-stroke rounded p-1 min-h-[32px] flex items-center gap-1 cursor-pointer hover:bg-card transition-colors"
          onClick={() => setEditingSlot(slotKey)}
        >
          <div className="text-[10px] text-muted font-semibold writing-mode-vertical transform rotate-180 leading-none" style={{ writingMode: 'vertical-rl' }}>
            {label}
          </div>
          <div className="flex-1 border-l border-stroke pl-1">
            {item ? (
              <div className="text-xs truncate" title={item.name}>
                {item.name}
              </div>
            ) : (
              <div className="text-xs text-muted italic">-</div>
            )}
          </div>
        </div>
      </Tooltip>
    )
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return

    const newBackpack = [...backpack]
    const draggedItem = newBackpack[draggedIndex]
    newBackpack.splice(draggedIndex, 1)
    newBackpack.splice(targetIndex, 0, draggedItem)

    onBackpackChange(newBackpack)
    setDraggedIndex(null)
  }

  const renderBackpackSlot = (item: EquipmentItem | null, index: number) => {
    const isQuickDraw = index < quickDrawSlots
    const difficulty = index + 1
    const opacityClass = difficulty > 5 ? 'opacity-60' : difficulty > 7 ? 'opacity-40' : 'opacity-100'

    return (
      <div
        key={index}
        draggable
        onDragStart={() => handleDragStart(index)}
        onDragOver={handleDragOver}
        onDrop={() => handleDrop(index)}
        className={`bg-card-muted border border-stroke rounded p-1 min-h-[32px] flex flex-col justify-center cursor-move ${opacityClass} ${draggedIndex === index ? 'opacity-50' : ''}`}
      >
        {isQuickDraw && (
          <div className="mb-0.5">
            <span className="text-[10px] bg-accent text-card px-0.5 rounded leading-none">SR</span>
          </div>
        )}
        <div className="flex-1">
          {item ? (
            <div className="text-xs truncate" title={item.name}>
              {item.name}
            </div>
          ) : (
            <div className="text-xs text-muted italic">-</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <Card>
        <div className="flex gap-2">
          {/* Left Side - Equipped Items */}
          <div className="flex-1">
            <Tooltip content="Itens equipados atualmente pelo personagem" className="cursor-help">
              <div className="text-sm font-semibold mb-1">
                Equipado
              </div>
            </Tooltip>

            {/* All Equipment Stacked */}
            <div className="space-y-1">
              {renderSlot(equippedItems.rightHand, 'rightHand')}
              {renderSlot(equippedItems.leftHand, 'leftHand')}
              {renderSlot(equippedItems.slot1, 'slot1')}
              {renderSlot(equippedItems.slot2, 'slot2')}
              {renderSlot(equippedItems.slot3, 'slot3')}
              {renderSlot(equippedItems.slot4, 'slot4')}
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="w-px bg-stroke" />

          {/* Right Side - Quick Draw & Backpack */}
          <div className="flex-1">
            {/* Quick Draw Section */}
            <Tooltip content="Itens que podem ser sacados rapidamente em combate" className="cursor-help">
              <div className="text-sm font-semibold mb-1">
                Saque Rápido
              </div>
            </Tooltip>
            <div className="space-y-1 mb-1">
              {renderSlot(equippedItems.quickDraw1, 'quickDraw1')}
              {renderSlot(equippedItems.quickDraw2, 'quickDraw2')}
            </div>

            {/* Backpack Section */}
            <div className="mb-1">
              <Tooltip content={`Itens guardados na mochila. Os ${quickDrawSlots} primeiros slots são saque rápido baseado em DES`} className="cursor-help">
                <div className="text-sm font-semibold">
                  Mochila
                  <span className="text-xs text-muted ml-1">({quickDrawSlots} SR)</span>
                </div>
              </Tooltip>
              <div
                className="flex items-center gap-1 text-[10px] mt-0.5 cursor-pointer hover:opacity-70 transition-opacity"
                onClick={handleOpenCurrencyModal}
              >
                <span className="text-yellow-600 font-semibold">{currencies.to} TO</span>
                <span className="text-gray-400">|</span>
                <span className="text-gray-300 font-semibold">{currencies.tp} TP</span>
                <span className="text-gray-400">|</span>
                <span className="text-orange-700 font-semibold">{currencies.tc} TC</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1">
              {backpack.slice(0, 9).map((item, index) => renderBackpackSlot(item, index))}
            </div>
          </div>
        </div>
      </Card>

      {/* Equipment Selection Modal */}
      <Modal
        isOpen={editingSlot !== null}
        onClose={() => setEditingSlot(null)}
        title={editingSlot ? `Equipar em ${slotLabels[editingSlot].tooltip}` : ''}
      >
        <div className="space-y-2">
          {/* Current equipped item */}
          {editingSlot && equippedItems[editingSlot] && (
            <div className="mb-3 pb-3 border-b border-stroke">
              <div className="text-xs text-muted mb-1">Equipado:</div>
              <div className="bg-card-muted border border-stroke rounded p-2">
                <div className="font-semibold text-sm">{equippedItems[editingSlot]?.name}</div>
                {equippedItems[editingSlot]?.description && (
                  <div className="text-xs text-muted mt-0.5">{equippedItems[editingSlot]?.description}</div>
                )}
              </div>

              {/* Quick Draw swap options */}
              {(editingSlot === 'quickDraw1' || editingSlot === 'quickDraw2') && (
                <div className="mt-2 space-y-1">
                  <div className="text-xs text-muted mb-1">Equipar nas mãos:</div>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      onClick={() => handleSwapToHand('rightHand')}
                      className="py-1.5 bg-accent text-card rounded hover:bg-accent-hover transition-colors text-xs font-semibold"
                    >
                      Mão Direita
                      {equippedItems.rightHand && (
                        <div className="text-[10px] opacity-70 truncate">↔ {equippedItems.rightHand.name}</div>
                      )}
                    </button>
                    <button
                      onClick={() => handleSwapToHand('leftHand')}
                      className="py-1.5 bg-accent text-card rounded hover:bg-accent-hover transition-colors text-xs font-semibold"
                    >
                      Mão Esquerda
                      {equippedItems.leftHand && (
                        <div className="text-[10px] opacity-70 truncate">↔ {equippedItems.leftHand.name}</div>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={handleUnequipItem}
                className="mt-2 w-full py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-semibold"
              >
                Desequipar
              </button>
            </div>
          )}

          {/* Available items from backpack */}
          <div className="text-xs text-muted mb-2">Itens disponíveis na mochila:</div>
          <div className="space-y-2">
            {backpack.map((item, index) => {
              if (!item) return null
              return (
                <button
                  key={index}
                  onClick={() => handleEquipItem(item, index)}
                  className="w-full p-2 bg-card-muted border border-stroke rounded hover:bg-card transition-colors text-left"
                >
                  <div className="font-semibold text-sm">{item.name}</div>
                  {item.description && (
                    <div className="text-xs text-muted mt-0.5">{item.description}</div>
                  )}
                </button>
              )
            })}
            {backpack.every(item => item === null) && (
              <div className="text-xs text-muted italic text-center py-4">Nenhum item disponível na mochila</div>
            )}
          </div>
        </div>
      </Modal>

      {/* Currency Editor Modal */}
      <Modal
        isOpen={isCurrencyModalOpen}
        onClose={() => setIsCurrencyModalOpen(false)}
        title="Editar Moedas"
      >
        <div className="space-y-4">
          {/* Tibares de Ouro */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-yellow-600">
              Tibares de Ouro (TO)
            </label>
            <div className="flex items-center justify-center gap-1">
              {/* Botões de subtração */}
              <div className="flex gap-0.5">
                <button
                  onClick={() => setEditingCurrencies({ ...editingCurrencies, to: Math.max(0, editingCurrencies.to - 100) })}
                  className="px-1.5 py-0.5 text-xs bg-card-muted border border-stroke rounded hover:bg-card transition-colors"
                >
                  -100
                </button>
                <button
                  onClick={() => setEditingCurrencies({ ...editingCurrencies, to: Math.max(0, editingCurrencies.to - 10) })}
                  className="px-1.5 py-0.5 text-xs bg-card-muted border border-stroke rounded hover:bg-card transition-colors"
                >
                  -10
                </button>
                <button
                  onClick={() => setEditingCurrencies({ ...editingCurrencies, to: Math.max(0, editingCurrencies.to - 1) })}
                  className="px-1.5 py-0.5 text-xs bg-card-muted border border-stroke rounded hover:bg-card transition-colors"
                >
                  -1
                </button>
              </div>

              {/* Campo de input */}
              <input
                type="number"
                value={editingCurrencies.to}
                onChange={(e) => setEditingCurrencies({ ...editingCurrencies, to: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-20 px-2 py-2 bg-card-muted border border-stroke rounded focus:outline-none focus:border-accent text-center"
                min="0"
              />

              {/* Botões de adição */}
              <div className="flex gap-0.5">
                <button
                  onClick={() => setEditingCurrencies({ ...editingCurrencies, to: editingCurrencies.to + 1 })}
                  className="px-1.5 py-0.5 text-xs bg-card-muted border border-stroke rounded hover:bg-card transition-colors"
                >
                  +1
                </button>
                <button
                  onClick={() => setEditingCurrencies({ ...editingCurrencies, to: editingCurrencies.to + 10 })}
                  className="px-1.5 py-0.5 text-xs bg-card-muted border border-stroke rounded hover:bg-card transition-colors"
                >
                  +10
                </button>
                <button
                  onClick={() => setEditingCurrencies({ ...editingCurrencies, to: editingCurrencies.to + 100 })}
                  className="px-1.5 py-0.5 text-xs bg-card-muted border border-stroke rounded hover:bg-card transition-colors"
                >
                  +100
                </button>
              </div>
            </div>
          </div>

          {/* Tibares de Prata */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-300">
              Tibares de Prata (TP)
            </label>
            <div className="flex items-center justify-center gap-1">
              {/* Botões de subtração */}
              <div className="flex gap-0.5">
                <button
                  onClick={() => setEditingCurrencies({ ...editingCurrencies, tp: Math.max(0, editingCurrencies.tp - 100) })}
                  className="px-1.5 py-0.5 text-xs bg-card-muted border border-stroke rounded hover:bg-card transition-colors"
                >
                  -100
                </button>
                <button
                  onClick={() => setEditingCurrencies({ ...editingCurrencies, tp: Math.max(0, editingCurrencies.tp - 10) })}
                  className="px-1.5 py-0.5 text-xs bg-card-muted border border-stroke rounded hover:bg-card transition-colors"
                >
                  -10
                </button>
                <button
                  onClick={() => setEditingCurrencies({ ...editingCurrencies, tp: Math.max(0, editingCurrencies.tp - 1) })}
                  className="px-1.5 py-0.5 text-xs bg-card-muted border border-stroke rounded hover:bg-card transition-colors"
                >
                  -1
                </button>
              </div>

              {/* Campo de input */}
              <input
                type="number"
                value={editingCurrencies.tp}
                onChange={(e) => setEditingCurrencies({ ...editingCurrencies, tp: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-20 px-2 py-2 bg-card-muted border border-stroke rounded focus:outline-none focus:border-accent text-center"
                min="0"
              />

              {/* Botões de adição */}
              <div className="flex gap-0.5">
                <button
                  onClick={() => setEditingCurrencies({ ...editingCurrencies, tp: editingCurrencies.tp + 1 })}
                  className="px-1.5 py-0.5 text-xs bg-card-muted border border-stroke rounded hover:bg-card transition-colors"
                >
                  +1
                </button>
                <button
                  onClick={() => setEditingCurrencies({ ...editingCurrencies, tp: editingCurrencies.tp + 10 })}
                  className="px-1.5 py-0.5 text-xs bg-card-muted border border-stroke rounded hover:bg-card transition-colors"
                >
                  +10
                </button>
                <button
                  onClick={() => setEditingCurrencies({ ...editingCurrencies, tp: editingCurrencies.tp + 100 })}
                  className="px-1.5 py-0.5 text-xs bg-card-muted border border-stroke rounded hover:bg-card transition-colors"
                >
                  +100
                </button>
              </div>
            </div>
          </div>

          {/* Tibares de Cobre */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-orange-700">
              Tibares de Cobre (TC)
            </label>
            <div className="flex items-center justify-center gap-1">
              {/* Botões de subtração */}
              <div className="flex gap-0.5">
                <button
                  onClick={() => setEditingCurrencies({ ...editingCurrencies, tc: Math.max(0, editingCurrencies.tc - 100) })}
                  className="px-1.5 py-0.5 text-xs bg-card-muted border border-stroke rounded hover:bg-card transition-colors"
                >
                  -100
                </button>
                <button
                  onClick={() => setEditingCurrencies({ ...editingCurrencies, tc: Math.max(0, editingCurrencies.tc - 10) })}
                  className="px-1.5 py-0.5 text-xs bg-card-muted border border-stroke rounded hover:bg-card transition-colors"
                >
                  -10
                </button>
                <button
                  onClick={() => setEditingCurrencies({ ...editingCurrencies, tc: Math.max(0, editingCurrencies.tc - 1) })}
                  className="px-1.5 py-0.5 text-xs bg-card-muted border border-stroke rounded hover:bg-card transition-colors"
                >
                  -1
                </button>
              </div>

              {/* Campo de input */}
              <input
                type="number"
                value={editingCurrencies.tc}
                onChange={(e) => setEditingCurrencies({ ...editingCurrencies, tc: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-20 px-2 py-2 bg-card-muted border border-stroke rounded focus:outline-none focus:border-accent text-center"
                min="0"
              />

              {/* Botões de adição */}
              <div className="flex gap-0.5">
                <button
                  onClick={() => setEditingCurrencies({ ...editingCurrencies, tc: editingCurrencies.tc + 1 })}
                  className="px-1.5 py-0.5 text-xs bg-card-muted border border-stroke rounded hover:bg-card transition-colors"
                >
                  +1
                </button>
                <button
                  onClick={() => setEditingCurrencies({ ...editingCurrencies, tc: editingCurrencies.tc + 10 })}
                  className="px-1.5 py-0.5 text-xs bg-card-muted border border-stroke rounded hover:bg-card transition-colors"
                >
                  +10
                </button>
                <button
                  onClick={() => setEditingCurrencies({ ...editingCurrencies, tc: editingCurrencies.tc + 100 })}
                  className="px-1.5 py-0.5 text-xs bg-card-muted border border-stroke rounded hover:bg-card transition-colors"
                >
                  +100
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveCurrencies}
            className="w-full py-2 bg-accent text-card rounded hover:bg-accent-hover transition-colors text-sm font-semibold"
          >
            Salvar
          </button>
        </div>
      </Modal>
    </>
  )
}

export default EquipmentCard
