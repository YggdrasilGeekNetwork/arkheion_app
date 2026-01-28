type CharacterHeaderProps = {
  name: string
  imageUrl?: string
  classes: { name: string; level: number; tooltip?: string }[]
  origin?: { name: string; tooltip?: string }
  deity?: { name: string; tooltip?: string }
  onSettings?: () => void
}

const CharacterHeader = ({ name, imageUrl, classes, origin, deity, onSettings }: CharacterHeaderProps) => {
  const totalLevel = classes.reduce((sum, c) => sum + c.level, 0)

  return (
    <header className="bg-card border-b border-stroke md:border-none relative z-[100]">
      <div className="px-[2vw] md:px-[1.5vw] py-[0.5vh] md:py-[1vh] relative flex gap-[1.5vw] md:gap-[1.5vw] items-center max-w-[95vw] md:mx-auto">
        {/* Character Image */}
        {imageUrl && (
          <div className="w-[15vw] h-[15vw] md:w-16 md:h-16 max-w-[80px] max-h-[80px] md:max-w-none md:max-h-none rounded-lg overflow-hidden border border-stroke flex-shrink-0">
            <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Character Info */}
        <div className="flex-1 min-w-0 md:flex md:items-center md:gap-[2vw]">
          <div className="flex items-center gap-2 md:flex-shrink-0">
            <h1 className="m-0 font-bold text-text truncate" style={{ fontSize: 'clamp(1.125rem, 4.5vw, 1.75rem)' }}>{name}</h1>
            <span className="bg-accent text-card rounded px-2 py-0.5 font-bold flex-shrink-0" style={{ fontSize: 'clamp(0.875rem, 3.5vw, 1.125rem)' }}>
              {totalLevel}
            </span>
          </div>

          {/* Classes, Origin & Deity - Horizontal on Desktop */}
          <div className="md:flex md:items-center md:gap-[1.5vw] md:flex-wrap">
            {/* Classes */}
            <div className="mt-[0.25vh] md:mt-0 flex flex-wrap items-center gap-[0.75vw]" style={{ fontSize: 'clamp(0.75rem, 3vw, 1rem)' }}>
              {classes.map((cls, idx) => (
                <span key={idx} className="relative group">
                  <span className="text-muted">{cls.name} {cls.level}</span>
                  {idx < classes.length - 1 && <span className="text-muted mx-[0.5vw]">/</span>}
                  {cls.tooltip && (
                    <div className="absolute left-0 top-full mt-1 hidden group-hover:block bg-card border border-stroke rounded p-1.5 shadow-lg z-10 w-[40vw] md:w-[15vw] max-w-[200px] pointer-events-none" style={{ fontSize: 'clamp(0.7rem, 2.5vw, 0.875rem)' }}>
                      {cls.tooltip}
                    </div>
                  )}
                </span>
              ))}
            </div>

            {/* Origin & Deity */}
            <div className="mt-[0.25vh] md:mt-0 flex flex-wrap items-center gap-[1.5vw]" style={{ fontSize: 'clamp(0.75rem, 3vw, 1rem)' }}>
              {origin && (
                <span className="relative group">
                  <span className="text-muted">{origin.name}</span>
                  {origin.tooltip && (
                    <div className="absolute left-0 top-full mt-1 hidden group-hover:block bg-card border border-stroke rounded p-1.5 shadow-lg z-10 w-[40vw] md:w-[15vw] max-w-[200px] pointer-events-none" style={{ fontSize: 'clamp(0.7rem, 2.5vw, 0.875rem)' }}>
                      {origin.tooltip}
                    </div>
                  )}
                </span>
              )}
              {origin && deity && <span className="text-muted">•</span>}
              {deity && (
                <span className="relative group">
                  <span className="text-muted">{deity.name}</span>
                  {deity.tooltip && (
                    <div className="absolute left-0 top-full mt-1 hidden group-hover:block bg-card border border-stroke rounded p-1.5 shadow-lg z-10 w-[40vw] md:w-[15vw] max-w-[200px] pointer-events-none" style={{ fontSize: 'clamp(0.7rem, 2.5vw, 0.875rem)' }}>
                      {deity.tooltip}
                    </div>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Settings Button */}
        <button
          onClick={onSettings}
          className="text-muted flex-shrink-0"
          style={{ fontSize: 'clamp(1.25rem, 5vw, 2rem)' }}
          aria-label="Settings"
        >
          ⚙️
        </button>
      </div>
    </header>
  )
}

export default CharacterHeader