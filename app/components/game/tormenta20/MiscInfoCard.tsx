import Card from '~/components/ui/Card'

type MiscInfoCardProps = {
  title: string
  value: string | number
  subtitle?: string
  tooltip?: string
}

const MiscInfoCard = ({ title, value, subtitle, tooltip }: MiscInfoCardProps) => {
  return (
    <div className="relative group bg-card border border-stroke rounded-lg p-2">
      <div className="flex items-baseline justify-between">
        <div className="text-xs font-semibold text-muted">
          {title} {tooltip && <span className="opacity-50">?</span>}
        </div>
        <div className="text-base font-bold">{value}</div>
      </div>
      {subtitle && (
        <div className="text-xs text-muted mt-0.5">{subtitle}</div>
      )}
      {tooltip && (
        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-card border border-stroke rounded-lg p-2 shadow-lg z-10 w-48 cursor-help">
          <div className="text-xs">{tooltip}</div>
        </div>
      )}
    </div>
  )
}

export default MiscInfoCard
