import type { ReactNode } from 'react'

type QuadrantContainerProps = {
  title: string
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  children: ReactNode
}

export default function QuadrantContainer({ title, children }: QuadrantContainerProps) {
  return (
    <div className="bg-card border border-stroke rounded-lg p-3 flex flex-col overflow-hidden">
      <div className="text-sm font-semibold text-muted mb-2 flex-shrink-0">{title}</div>
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
}
