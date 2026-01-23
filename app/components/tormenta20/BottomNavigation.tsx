export type NavItem = {
  id: string
  label: string
}

export type BottomNavigationProps = {
  items: NavItem[]
  activeItem: string
  onItemChange: (itemId: string) => void
  isFixed?: boolean
}

const BottomNavigation = ({ items, activeItem, onItemChange, isFixed = true }: BottomNavigationProps) => {
  const baseClasses = "w-full bg-footer-bg border-t border-stroke flex justify-around py-[1.5vh] px-0"
  const positionClasses = isFixed ? "fixed bottom-0 max-w-[430px]" : ""

  return (
    <footer className={`${baseClasses} ${positionClasses}`}>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onItemChange(item.id)}
          className={`text-center ${
            activeItem === item.id ? 'text-text font-semibold' : 'text-muted'
          }`}
          style={{ fontSize: 'clamp(0.7rem, 2.5vw, 0.875rem)' }}
        >
          {item.label}
        </button>
      ))}
    </footer>
  )
}

export default BottomNavigation