import { useState } from 'react'
import Card from '~/components/ui/Card'
import Modal from '~/components/ui/Modal'
import type { Character, EquipmentItem, EquippedItems, Currencies } from '~/types/character'

type EquippedItemsSummaryCardProps = {
  character: Character
  onEquippedItemsChange: (newItems: EquippedItems) => void
  onBackpackChange: (newBackpack: (EquipmentItem | null)[]) => void
  onUseConsumable: (item: EquipmentItem, source: 'equipped' | 'backpack', slotKey: string) => void
  onCombatAction: (description: string, actionCost: string, execute: () => void) => void
  currencies?: Currencies
  onCurrenciesChange?: (newCurrencies: Currencies) => void
}

const QUICK_ACCESS_SLOTS = ['rightHand', 'leftHand', 'quickDraw1', 'quickDraw2']

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

export default function EquippedItemsSummaryCard({
  character,
  onEquippedItemsChange,
  onBackpackChange,
  onUseConsumable,
  onCombatAction,
  currencies,
  onCurrenciesChange,
}: EquippedItemsSummaryCardProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [currencyModalOpen, setCurrencyModalOpen] = useState(false)
  const [editTO, setEditTO] = useState(currencies?.to.toString() || '0')
  const [editTP, setEditTP] = useState(currencies?.tp.toString() || '0')
  const [editTC, setEditTC] = useState(currencies?.tc.toString() || '0')

  const equippedItems = character.equippedItems

  // N = floor(defenseBonus / 2), defenseBonus = DES + armor(2) + shield(2) + others(3)
  const desModifier = character.attributes.find(a => a.label === 'DES')?.modifier || 0
  const defenseBonus = desModifier + 2 + 2 + 3
  const backpackSwapCount = Math.floor(defenseBonus / 2)

  const selectedItem = selectedSlot ? equippedItems[selectedSlot as keyof EquippedItems] : null

  const backpackSwapOptions = character.backpack
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item !== null)
    .slice(0, backpackSwapCount)

  const hasConsumableEffects = selectedItem?.effects?.some(e => e.type === 'consumable') ?? false

  const handleOpenCurrencyModal = () => {
    setEditTO(currencies?.to.toString() || '0')
    setEditTP(currencies?.tp.toString() || '0')
    setEditTC(currencies?.tc.toString() || '0')
    setCurrencyModalOpen(true)
  }

  const handleSaveCurrencies = () => {
    if (onCurrenciesChange) {
      onCurrenciesChange({
        to: parseInt(editTO) || 0,
        tp: parseInt(editTP) || 0,
        tc: parseInt(editTC) || 0,
      })
    }
    setCurrencyModalOpen(false)
  }

  const handleAddCurrency = (type: 'to' | 'tp' | 'tc', amount: number) => {
    const current = {
      to: parseInt(editTO) || 0,
      tp: parseInt(editTP) || 0,
      tc: parseInt(editTC) || 0,
    }
    current[type] = Math.max(0, current[type] + amount)
    setEditTO(current.to.toString())
    setEditTP(current.tp.toString())
    setEditTC(current.tc.toString())
  }

  const handleSwap = (targetSlot: string, targetSource: 'equipped' | 'backpack', targetIndex?: number) => {
    if (!selectedSlot) return

    const actionCost = targetSource === 'backpack' || !QUICK_ACCESS_SLOTS.includes(selectedSlot) || !QUICK_ACCESS_SLOTS.includes(targetSlot)
      ? 'standard'
      : 'free'
    const targetLabel = targetSource === 'backpack' ? 'item da mochila' : SLOT_LABELS[targetSlot] || targetSlot
    const description = `Trocar ${SLOT_LABELS[selectedSlot]} com ${targetLabel}`

    onCombatAction(description, actionCost, () => {
      const newEquipped = { ...equippedItems }

      if (targetSource === 'equipped') {
        const sourceItem = newEquipped[selectedSlot as keyof EquippedItems]
        const targetItem = newEquipped[targetSlot as keyof EquippedItems]
        newEquipped[selectedSlot as keyof EquippedItems] = targetItem
        newEquipped[targetSlot as keyof EquippedItems] = sourceItem
        onEquippedItemsChange(newEquipped)
      } else if (targetSource === 'backpack' && targetIndex !== undefined) {
        const newBackpack = [...character.backpack]
        const sourceItem = newEquipped[selectedSlot as keyof EquippedItems]
        newEquipped[selectedSlot as keyof EquippedItems] = newBackpack[targetIndex]
        newBackpack[targetIndex] = sourceItem
        onEquippedItemsChange(newEquipped)
        onBackpackChange(newBackpack)
      }

      setSelectedSlot(null)
    })
  }

  const renderItem = (item: EquipmentItem | null, slotKey: string, fallbackText: string) => (
    <div
      className="cursor-pointer hover:text-accent transition-colors"
      onClick={() => setSelectedSlot(slotKey)}
    >
      {item ? (
        <span className="text-xs md:text-sm font-semibold truncate block" title={item.name}>
          {item.name}
          {item.quantity && item.quantity > 1 && (
            <span className="text-muted ml-1">×{item.quantity}</span>
          )}
        </span>
      ) : (
        <span className="text-muted italic text-xs md:text-sm">{fallbackText}</span>
      )}
    </div>
  )

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm md:text-base font-bold">Equipamento</h3>
          {currencies && (
            <button
              onClick={handleOpenCurrencyModal}
              className="flex items-center gap-1.5 text-[10px] md:text-xs px-2 py-0.5 bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
            >
              <span className="text-yellow-600 font-bold">{currencies.to}</span>
              <span className="text-muted">/</span>
              <span className="text-gray-300 font-bold">{currencies.tp}</span>
              <span className="text-muted">/</span>
              <span className="text-orange-700 font-bold">{currencies.tc}</span>
            </button>
          )}
        </div>

        <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            <div>
              <div className="text-[10px] md:text-xs text-muted mb-0.5">Mão Direita</div>
              {renderItem(equippedItems.rightHand, 'rightHand', 'Vazio')}
            </div>
            <div>
              <div className="text-[10px] md:text-xs text-muted mb-0.5">Mão Esquerda</div>
              {renderItem(equippedItems.leftHand, 'leftHand', 'Vazio')}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 md:gap-3">
            <div>
              <div className="text-[10px] md:text-xs text-muted mb-0.5">Saque Rápido 1</div>
              {renderItem(equippedItems.quickDraw1, 'quickDraw1', 'Vazio')}
            </div>
            <div>
              <div className="text-[10px] md:text-xs text-muted mb-0.5">Saque Rápido 2</div>
              {renderItem(equippedItems.quickDraw2, 'quickDraw2', 'Vazio')}
            </div>
          </div>

          <div>
            <div className="text-[10px] md:text-xs text-muted mb-0.5">Slots de Utilidade</div>
            <div className="flex flex-wrap gap-1 md:gap-1.5">
              {(['slot1', 'slot2', 'slot3', 'slot4'] as const).map((slotKey) => {
                const item = equippedItems[slotKey]
                if (!item) return null
                return (
                  <span
                    key={slotKey}
                    className="text-[10px] md:text-xs bg-card-muted px-1.5 py-0.5 rounded truncate max-w-[45%] cursor-pointer hover:border-accent border border-transparent transition-colors"
                    title={item.name}
                    onClick={() => setSelectedSlot(slotKey)}
                  >
                    {item.name}
                  </span>
                )
              })}
              {[equippedItems.slot1, equippedItems.slot2, equippedItems.slot3, equippedItems.slot4].every(item => !item) && (
                <span className="text-muted italic text-[10px] md:text-xs">Nenhum item</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Item Detail Modal */}
      <Modal
        isOpen={selectedSlot !== null}
        onClose={() => setSelectedSlot(null)}
        title={selectedItem?.name || SLOT_LABELS[selectedSlot || ''] || 'Slot'}
      >
        {selectedItem ? (
          <div className="space-y-4">
            {/* Details */}
            <div>
              {selectedItem.description && (
                <p className="text-sm text-muted">{selectedItem.description}</p>
              )}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {selectedItem.category && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-card-muted rounded capitalize">{selectedItem.category}</span>
                )}
                {selectedItem.weight && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-card-muted rounded">{selectedItem.weight} kg</span>
                )}
                {selectedItem.spaces && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-card-muted rounded">{selectedItem.spaces} esp.</span>
                )}
                {selectedItem.price && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-card-muted rounded">{selectedItem.price} TP</span>
                )}
              </div>
            </div>

            {/* Effects */}
            {selectedItem.effects && selectedItem.effects.length > 0 && (
              <div>
                <div className="text-sm font-semibold mb-1.5">Efeitos</div>
                <div className="space-y-1.5">
                  {selectedItem.effects.map((effect, idx) => (
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

            {/* Use consumable */}
            {hasConsumableEffects && (
              <button
                onClick={() => {
                  const consumableEffect = selectedItem!.effects?.find(e => e.type === 'consumable')
                  const actionCost = consumableEffect?.activeAbility?.actionType || 'standard'
                  onCombatAction(`Usar consumível: ${selectedItem!.name}`, actionCost, () => {
                    onUseConsumable(selectedItem!, 'equipped', selectedSlot!)
                    setSelectedSlot(null)
                  })
                }}
                className="w-full py-2 bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded hover:bg-orange-500/30 transition-colors text-sm font-semibold"
              >
                Usar
              </button>
            )}

            {/* Swap options */}
            <div>
              <div className="text-sm font-semibold mb-1.5">Trocar com</div>
              <div className="space-y-1.5">
                {/* Swap hands */}
                {(selectedSlot === 'rightHand' || selectedSlot === 'leftHand') && (
                  <button
                    onClick={() => handleSwap(
                      selectedSlot === 'rightHand' ? 'leftHand' : 'rightHand',
                      'equipped'
                    )}
                    className="w-full text-left text-xs p-2 bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                  >
                    <span className="font-semibold">{selectedSlot === 'rightHand' ? 'Mão Esquerda' : 'Mão Direita'}</span>
                    <span className="text-muted ml-1.5">
                      {equippedItems[selectedSlot === 'rightHand' ? 'leftHand' : 'rightHand']?.name || 'vazio'}
                    </span>
                  </button>
                )}

                {/* Swap with hands (when quick draw is selected) */}
                {(selectedSlot === 'quickDraw1' || selectedSlot === 'quickDraw2') && (
                  <>
                    <button
                      onClick={() => handleSwap('rightHand', 'equipped')}
                      className="w-full text-left text-xs p-2 bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                    >
                      <span className="font-semibold">Mão Direita</span>
                      <span className="text-muted ml-1.5">{equippedItems.rightHand?.name || 'vazio'}</span>
                    </button>
                    <button
                      onClick={() => handleSwap('leftHand', 'equipped')}
                      className="w-full text-left text-xs p-2 bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                    >
                      <span className="font-semibold">Mão Esquerda</span>
                      <span className="text-muted ml-1.5">{equippedItems.leftHand?.name || 'vazio'}</span>
                    </button>
                  </>
                )}

                {/* Quick draw */}
                {(['quickDraw1', 'quickDraw2'] as const)
                  .filter(s => s !== selectedSlot)
                  .map((qd) => (
                    <button
                      key={qd}
                      onClick={() => handleSwap(qd, 'equipped')}
                      className="w-full text-left text-xs p-2 bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                    >
                      <span className="font-semibold">{qd === 'quickDraw1' ? 'Saque Rápido 1' : 'Saque Rápido 2'}</span>
                      <span className="text-muted ml-1.5">{equippedItems[qd]?.name || 'vazio'}</span>
                    </button>
                  ))}

                {/* First N backpack items */}
                {backpackSwapOptions.map(({ item, index }) => (
                  <button
                    key={index}
                    onClick={() => handleSwap('', 'backpack', index)}
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

      {/* Currency Edit Modal */}
      {currencies && onCurrenciesChange && (
        <Modal
          isOpen={currencyModalOpen}
          onClose={() => setCurrencyModalOpen(false)}
          title="Editar Moedas"
        >
          <div className="space-y-4">
            {/* Tibares de Ouro */}
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5">
                Tibares de Ouro (TO)
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleAddCurrency('to', -100)}
                  className="px-2 py-1.5 text-xs bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                >
                  -100
                </button>
                <button
                  onClick={() => handleAddCurrency('to', -10)}
                  className="px-2 py-1.5 text-xs bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                >
                  -10
                </button>
                <button
                  onClick={() => handleAddCurrency('to', -1)}
                  className="px-2 py-1.5 text-xs bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                >
                  -1
                </button>
                <input
                  type="number"
                  value={editTO}
                  onChange={(e) => setEditTO(e.target.value)}
                  className="flex-1 px-2 py-1.5 text-sm bg-card-muted border border-stroke rounded text-center font-bold text-yellow-600"
                  min="0"
                />
                <button
                  onClick={() => handleAddCurrency('to', 1)}
                  className="px-2 py-1.5 text-xs bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                >
                  +1
                </button>
                <button
                  onClick={() => handleAddCurrency('to', 10)}
                  className="px-2 py-1.5 text-xs bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                >
                  +10
                </button>
                <button
                  onClick={() => handleAddCurrency('to', 100)}
                  className="px-2 py-1.5 text-xs bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                >
                  +100
                </button>
              </div>
            </div>

            {/* Tibares de Prata */}
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5">
                Tibares de Prata (TP)
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleAddCurrency('tp', -100)}
                  className="px-2 py-1.5 text-xs bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                >
                  -100
                </button>
                <button
                  onClick={() => handleAddCurrency('tp', -10)}
                  className="px-2 py-1.5 text-xs bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                >
                  -10
                </button>
                <button
                  onClick={() => handleAddCurrency('tp', -1)}
                  className="px-2 py-1.5 text-xs bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                >
                  -1
                </button>
                <input
                  type="number"
                  value={editTP}
                  onChange={(e) => setEditTP(e.target.value)}
                  className="flex-1 px-2 py-1.5 text-sm bg-card-muted border border-stroke rounded text-center font-bold text-gray-300"
                  min="0"
                />
                <button
                  onClick={() => handleAddCurrency('tp', 1)}
                  className="px-2 py-1.5 text-xs bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                >
                  +1
                </button>
                <button
                  onClick={() => handleAddCurrency('tp', 10)}
                  className="px-2 py-1.5 text-xs bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                >
                  +10
                </button>
                <button
                  onClick={() => handleAddCurrency('tp', 100)}
                  className="px-2 py-1.5 text-xs bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                >
                  +100
                </button>
              </div>
            </div>

            {/* Tibares de Cobre */}
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5">
                Tibares de Cobre (TC)
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleAddCurrency('tc', -100)}
                  className="px-2 py-1.5 text-xs bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                >
                  -100
                </button>
                <button
                  onClick={() => handleAddCurrency('tc', -10)}
                  className="px-2 py-1.5 text-xs bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                >
                  -10
                </button>
                <button
                  onClick={() => handleAddCurrency('tc', -1)}
                  className="px-2 py-1.5 text-xs bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                >
                  -1
                </button>
                <input
                  type="number"
                  value={editTC}
                  onChange={(e) => setEditTC(e.target.value)}
                  className="flex-1 px-2 py-1.5 text-sm bg-card-muted border border-stroke rounded text-center font-bold text-orange-700"
                  min="0"
                />
                <button
                  onClick={() => handleAddCurrency('tc', 1)}
                  className="px-2 py-1.5 text-xs bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                >
                  +1
                </button>
                <button
                  onClick={() => handleAddCurrency('tc', 10)}
                  className="px-2 py-1.5 text-xs bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                >
                  +10
                </button>
                <button
                  onClick={() => handleAddCurrency('tc', 100)}
                  className="px-2 py-1.5 text-xs bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
                >
                  +100
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="pt-2 border-t border-stroke">
              <div className="text-center">
                <div className="text-[10px] text-muted mb-0.5">Total em TP</div>
                <div className="text-lg font-bold">
                  {((parseInt(editTO) || 0) * 10 + (parseInt(editTP) || 0) + (parseInt(editTC) || 0) / 10).toFixed(1)} TP
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setCurrencyModalOpen(false)}
                className="flex-1 px-3 py-1.5 text-sm bg-card-muted border border-stroke rounded hover:border-accent transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCurrencies}
                className="flex-1 px-3 py-1.5 text-sm bg-accent text-card rounded hover:bg-accent-hover transition-colors font-semibold"
              >
                Salvar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
