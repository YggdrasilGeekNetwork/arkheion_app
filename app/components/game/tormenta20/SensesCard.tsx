import ToggleableListCard, { type ToggleableItem } from '~/components/ui/ToggleableListCard'

// ============================================================================
// Types
// ============================================================================

export type Sense = ToggleableItem & {
  value: string | number
}

export type SensesCardProps = {
  senses: Sense[]
  onSensesChange?: (senses: Sense[]) => void
}

// ============================================================================
// Component
// ============================================================================

export default function SensesCard({ senses, onSensesChange }: SensesCardProps) {
  return (
    <ToggleableListCard<Sense>
      title="Sentidos"
      modalTitle="Selecionar Sentidos"
      items={senses}
      onItemsChange={onSensesChange}
      displayConfig={{
        renderValue: (sense) => (
          <span className="font-bold">{sense.value}</span>
        ),
        renderModalExtra: (sense) => (
          <span className="font-bold text-sm ml-2">{sense.value}</span>
        ),
      }}
    />
  )
}