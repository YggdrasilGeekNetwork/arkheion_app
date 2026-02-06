import ToggleableListCard, { type ToggleableItem } from '~/components/ui/ToggleableListCard'

// ============================================================================
// Types
// ============================================================================

export type Proficiency = ToggleableItem & {
  // Proficiency only needs base ToggleableItem fields
  // But we keep the type for clarity and future extensibility
}

export type ProficienciesCardProps = {
  proficiencies: Proficiency[]
  onProficienciesChange?: (proficiencies: Proficiency[]) => void
}

// ============================================================================
// Component
// ============================================================================

export default function ProficienciesCard({
  proficiencies,
  onProficienciesChange,
}: ProficienciesCardProps) {
  return (
    <ToggleableListCard<Proficiency>
      title="Proficiências"
      modalTitle="Selecionar Proficiências"
      items={proficiencies}
      onItemsChange={onProficienciesChange}
      variant="bullet"
    />
  )
}