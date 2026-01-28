type TooltipProps = {
  children: React.ReactNode
  content: string | React.ReactNode
  className?: string
}

const Tooltip = ({ children, content, className = '' }: TooltipProps) => {
  return (
    <div className={`relative group ${className}`}>
      {children}
      <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block bg-card border border-stroke rounded p-1.5 shadow-lg z-10 w-48 max-w-[calc(100vw-2rem)] text-xs pointer-events-none">
        {content}
      </div>
    </div>
  )
}

export default Tooltip
