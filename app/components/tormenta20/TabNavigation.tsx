type Tab = {
  id: string
  label: string
}

type TabNavigationProps = {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

const TabNavigation = ({ tabs, activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <div className="flex px-3 gap-1.5">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 text-center py-2.5 text-sm rounded-t-lg whitespace-nowrap overflow-hidden text-ellipsis ${
            activeTab === tab.id
              ? 'bg-card text-text font-semibold border border-stroke border-b-0'
              : 'bg-card-muted text-muted'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default TabNavigation