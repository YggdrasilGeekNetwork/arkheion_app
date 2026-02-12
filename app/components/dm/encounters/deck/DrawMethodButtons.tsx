type DrawMethodButtonsProps = {
  onNimb: () => void
  onKhalmyr: () => void
  disabled: boolean
}

export default function DrawMethodButtons({ onNimb, onKhalmyr, disabled }: DrawMethodButtonsProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onNimb}
        disabled={disabled}
        className="flex-1 flex flex-col items-center gap-0.5 px-3 py-2 rounded-md text-xs font-medium
          bg-purple-600/20 border border-purple-500/50 text-purple-300
          hover:bg-purple-600/30 hover:border-purple-400
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-colors"
      >
        <span className="text-sm">🎲</span>
        <span>Nimb</span>
        <span className="text-[10px] opacity-60 font-normal">Aleatório</span>
      </button>

      <button
        onClick={onKhalmyr}
        disabled={disabled}
        className="flex-1 flex flex-col items-center gap-0.5 px-3 py-2 rounded-md text-xs font-medium
          bg-amber-600/20 border border-amber-500/50 text-amber-300
          hover:bg-amber-600/30 hover:border-amber-400
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-colors"
      >
        <span className="text-sm">⚖️</span>
        <span>Khalmyr</span>
        <span className="text-[10px] opacity-60 font-normal">Escolher</span>
      </button>
    </div>
  )
}
