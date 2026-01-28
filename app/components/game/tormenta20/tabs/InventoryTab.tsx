import type { Character } from '~/types/character'
import EquipmentCard from '../EquipmentCard'

type InventoryTabProps = {
  character: Character
  onBackpackChange: (newBackpack: typeof character.backpack) => void
  onEquippedItemsChange: (newItems: typeof character.equippedItems) => void
  onCurrenciesChange: (newCurrencies: typeof character.currencies) => void
}

export default function InventoryTab({
  character,
  onBackpackChange,
  onEquippedItemsChange,
  onCurrenciesChange,
}: InventoryTabProps) {
  return (
    <EquipmentCard
      desModifier={character.attributes.find(a => a.label === 'DES')?.modifier || 0}
      equippedItems={character.equippedItems}
      backpack={character.backpack}
      currencies={character.currencies}
      onBackpackChange={onBackpackChange}
      onEquippedItemsChange={onEquippedItemsChange}
      onCurrenciesChange={onCurrenciesChange}
    />
  )
}
