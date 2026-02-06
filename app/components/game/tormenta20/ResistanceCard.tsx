import ToggleableListCard, { type ToggleableItem } from '~/components/ui/ToggleableListCard'
import Rollable from './Rollable'

// ============================================================================
// Types
// ============================================================================

export type Resistance = ToggleableItem & {
  value: number
}

export type ResistanceCardProps = {
  resistances: Resistance[]
  onResistancesChange?: (resistances: Resistance[]) => void
}

// ============================================================================
// Helpers
// ============================================================================

function formatModifier(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`
}

// ============================================================================
// Component
// ============================================================================

export default function ResistanceCard({
  resistances,
  onResistancesChange,
}: ResistanceCardProps) {
  return (
    <ToggleableListCard<Resistance>
      title="Resistências"
      modalTitle="Selecionar Resistências"
      items={resistances}
      onItemsChange={onResistancesChange}
      displayConfig={{
        renderValue: (resistance) => (
          <Rollable label={resistance.name} modifier={resistance.value}>
            <span className="font-bold">{formatModifier(resistance.value)}</span>
          </Rollable>
        ),
        renderModalExtra: (resistance) => (
          <span className="font-bold text-sm ml-2">
            {formatModifier(resistance.value)}
          </span>
        ),
      }}
    />
  )
}