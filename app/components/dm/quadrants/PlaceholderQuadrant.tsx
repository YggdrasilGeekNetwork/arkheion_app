type PlaceholderQuadrantProps = {
  icon: string
  title: string
  description: string
}

export default function PlaceholderQuadrant({ icon, title, description }: PlaceholderQuadrantProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-4">
      <div className="text-4xl mb-3 opacity-50">{icon}</div>
      <div className="font-semibold text-muted mb-1">{title}</div>
      <div className="text-xs text-muted opacity-75">{description}</div>
    </div>
  )
}
