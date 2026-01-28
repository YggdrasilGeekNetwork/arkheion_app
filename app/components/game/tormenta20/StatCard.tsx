import Card from '~/components/ui/Card'
import Button from '~/components/ui/Button'

type StatCardProps = {
  title: string
  value: string | number
  subtitle?: string
  showRoll?: boolean
  onRoll?: () => void
}

const StatCard = ({ title, value, subtitle, showRoll, onRoll }: StatCardProps) => {
  return (
    <Card>
      <div className="text-sm font-semibold mb-1.5">{title}</div>
      <div className="flex justify-between items-center">
        <div className="text-2xl font-bold">{value}</div>
        {showRoll && (
          <Button variant="roll" onClick={onRoll}>
            ROLAR
          </Button>
        )}
      </div>
      {subtitle && (
        <div className="text-xs text-muted mt-1 leading-relaxed">
          {subtitle}
        </div>
      )}
    </Card>
  )
}

export default StatCard