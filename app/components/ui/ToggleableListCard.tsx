import { useState, useCallback, type ReactNode } from 'react'
import Card from '~/components/ui/Card'
import Modal from '~/components/ui/Modal'

// ============================================================================
// Types
// ============================================================================

/**
 * Base item type that all toggleable items must extend
 */
export type ToggleableItem = {
  name: string
  tooltip?: string
  visible?: boolean
}

/**
 * Configuration for how items are displayed in the card
 */
export type ItemDisplayConfig<T extends ToggleableItem> = {
  /** Render the main content/label of the item */
  renderLabel?: (item: T, index: number) => ReactNode
  /** Render the value/right side of the item (optional) */
  renderValue?: (item: T, index: number) => ReactNode
  /** Render additional content in the modal for each item */
  renderModalExtra?: (item: T, index: number) => ReactNode
  /** Custom class for each item row */
  itemClassName?: string
}

/**
 * Props for the ToggleableListCard component
 */
export type ToggleableListCardProps<T extends ToggleableItem> = {
  /** Card title displayed in the header */
  title: string
  /** Modal title (defaults to "Selecionar {title}") */
  modalTitle?: string
  /** Array of items to display */
  items: T[]
  /** Callback when items change (for toggle visibility) */
  onItemsChange?: (items: T[]) => void
  /** Configuration for item display */
  displayConfig?: ItemDisplayConfig<T>
  /** Whether to show the edit button */
  showEditButton?: boolean
  /** Custom edit button text */
  editButtonText?: string
  /** Layout variant for the list */
  variant?: 'default' | 'bullet' | 'compact'
  /** Accessibility label for the edit button */
  editButtonAriaLabel?: string
}

// ============================================================================
// Sub-components
// ============================================================================

type TooltipWrapperProps = {
  tooltip?: string
  children: ReactNode
}

function TooltipWrapper({ tooltip, children }: TooltipWrapperProps) {
  if (!tooltip) return <>{children}</>

  return (
    <div className="group relative">
      {children}
      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-card border border-stroke rounded-lg p-2 shadow-lg z-10 w-48">
        <div className="text-xs">{tooltip}</div>
      </div>
    </div>
  )
}

type CardHeaderProps = {
  title: string
  showEditButton: boolean
  editButtonText: string
  editButtonAriaLabel?: string
  onEditClick: () => void
}

function CardHeader({
  title,
  showEditButton,
  editButtonText,
  editButtonAriaLabel,
  onEditClick,
}: CardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-1">
      <div className="text-sm font-semibold">{title}</div>
      {showEditButton && (
        <button
          onClick={onEditClick}
          aria-label={editButtonAriaLabel || `Editar ${title}`}
          className="text-xs px-2 py-0.5 bg-card-muted text-muted border border-stroke rounded hover:bg-btn-bg transition-colors"
        >
          {editButtonText}
        </button>
      )}
    </div>
  )
}

type ModalItemProps<T extends ToggleableItem> = {
  item: T
  index: number
  isChecked: boolean
  onToggle: () => void
  renderModalExtra?: (item: T, index: number) => ReactNode
}

function ModalItem<T extends ToggleableItem>({
  item,
  index,
  isChecked,
  onToggle,
  renderModalExtra,
}: ModalItemProps<T>) {
  return (
    <label className="flex items-center justify-between p-2 rounded hover:bg-card-muted cursor-pointer">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={onToggle}
          className="cursor-pointer w-4 h-4"
        />
        <div>
          <div className="font-semibold text-sm">{item.name}</div>
          {item.tooltip && (
            <div className="text-xs text-muted mt-0.5">{item.tooltip}</div>
          )}
        </div>
      </div>
      {renderModalExtra?.(item, index)}
    </label>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export default function ToggleableListCard<T extends ToggleableItem>({
  title,
  modalTitle,
  items,
  onItemsChange,
  displayConfig = {},
  showEditButton = true,
  editButtonText = 'Ver/Editar',
  variant = 'default',
  editButtonAriaLabel,
}: ToggleableListCardProps<T>) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const visibleItems = items.filter(item => item.visible !== false)

  const toggleItem = useCallback(
    (index: number) => {
      if (!onItemsChange) return

      const updated = items.map((item, i) =>
        i === index ? { ...item, visible: !item.visible } : item
      )
      onItemsChange(updated)
    },
    [items, onItemsChange]
  )

  const {
    renderLabel,
    renderValue,
    renderModalExtra,
    itemClassName = '',
  } = displayConfig

  // Default label renderer
  const defaultRenderLabel = (item: T) => (
    <span className="text-muted">
      {item.name}
      {item.tooltip && <span className="opacity-50 ml-1">?</span>}
    </span>
  )

  // Render item based on variant
  const renderItem = (item: T, index: number) => {
    const label = renderLabel ? renderLabel(item, index) : defaultRenderLabel(item)
    const value = renderValue?.(item, index)

    if (variant === 'bullet') {
      return (
        <TooltipWrapper key={index} tooltip={item.tooltip}>
          <div className={`flex items-start text-sm ${itemClassName}`}>
            <span className="text-muted mr-1">•</span>
            <span className="text-muted flex-1">{label}</span>
          </div>
        </TooltipWrapper>
      )
    }

    return (
      <TooltipWrapper key={index} tooltip={item.tooltip}>
        <div className={`flex justify-between text-sm ${itemClassName}`}>
          {label}
          {value}
        </div>
      </TooltipWrapper>
    )
  }

  return (
    <>
      <Card>
        <CardHeader
          title={title}
          showEditButton={showEditButton}
          editButtonText={editButtonText}
          editButtonAriaLabel={editButtonAriaLabel}
          onEditClick={() => setIsModalOpen(true)}
        />

        <div className="space-y-1">
          {visibleItems.map((item, index) => renderItem(item, index))}
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle || `Selecionar ${title}`}
      >
        <div className="space-y-3">
          {items.map((item, index) => (
            <ModalItem
              key={index}
              item={item}
              index={index}
              isChecked={item.visible !== false}
              onToggle={() => toggleItem(index)}
              renderModalExtra={renderModalExtra}
            />
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-stroke">
          <button
            onClick={() => setIsModalOpen(false)}
            className="w-full py-2 bg-btn-bg border border-stroke rounded hover:bg-card-muted transition-colors font-semibold"
          >
            Concluir
          </button>
        </div>
      </Modal>
    </>
  )
}

// ============================================================================
// Utility Types for Consumers
// ============================================================================

/**
 * Helper type to create item types that extend ToggleableItem
 */
export type WithToggleable<T> = T & ToggleableItem

/**
 * Extract the item type from a ToggleableListCardProps
 */
export type ItemType<P> = P extends ToggleableListCardProps<infer T> ? T : never