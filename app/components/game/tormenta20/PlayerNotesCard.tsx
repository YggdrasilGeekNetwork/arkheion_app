import { useEffect, useRef } from 'react'

type PlayerNotesCardProps = {
  notes: string
  onChange: (notes: string) => void
}

export default function PlayerNotesCard({ notes, onChange }: PlayerNotesCardProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea to fit content
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [notes])

  return (
    <div className="bg-card border border-stroke rounded-lg flex flex-col flex-1 min-h-0">
      <div className="px-3 pt-2.5 pb-1.5 border-b border-stroke">
        <span className="text-xs font-semibold text-muted uppercase tracking-wide">Notas</span>
      </div>
      <textarea
        ref={textareaRef}
        value={notes}
        onChange={e => onChange(e.target.value)}
        placeholder="Escreva suas notas aqui..."
        className="flex-1 w-full bg-transparent resize-none p-3 text-sm text-foreground placeholder:text-muted/50 focus:outline-none leading-relaxed min-h-[200px]"
      />
    </div>
  )
}
