import { useState } from 'react'

type TopBarProps = {
  onAllCharacters?: () => void
}

const TopBar = ({ onAllCharacters }: TopBarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="bg-card border-b border-stroke relative z-[130]">
      <div className="flex items-center justify-between px-[2vw] md:px-[1.5vw] py-[0.75vh] md:py-[0.5vh] max-w-[95vw] md:mx-auto">
        {/* Left - All Characters Button */}
        <button
          onClick={onAllCharacters}
          className="font-semibold text-muted hover:text-text transition-colors px-[1.5vw] md:px-[1vw] py-[0.5vh] rounded hover:bg-card-muted"
          style={{ fontSize: 'clamp(0.75rem, 3vw, 0.875rem)' }}
        >
          Personagens
        </button>

        {/* Center - Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <div className="font-bold text-accent" style={{ fontSize: 'clamp(1.125rem, 4.5vw, 1.5rem)' }}>ARKHEION</div>
        </div>

        {/* Right - Hamburger Menu */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-card-muted rounded transition-colors"
            aria-label="Menu"
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className="w-full h-0.5 bg-text"></span>
              <span className="w-full h-0.5 bg-text"></span>
              <span className="w-full h-0.5 bg-text"></span>
            </div>
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <>
              {/* Overlay to close menu */}
              <div
                className="fixed inset-0 z-[110]"
                onClick={() => setIsMenuOpen(false)}
              />

              {/* Menu Content */}
              <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-stroke rounded-lg shadow-lg z-[120] py-1">
                <button
                  onClick={() => {
                    console.log('Configurações')
                    setIsMenuOpen(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-card-muted transition-colors"
                >
                  Configurações
                </button>
                <button
                  onClick={() => {
                    console.log('Ajuda')
                    setIsMenuOpen(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-card-muted transition-colors"
                >
                  Ajuda
                </button>
                <div className="h-px bg-stroke my-1" />
                <button
                  onClick={() => {
                    console.log('Sair')
                    setIsMenuOpen(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-card-muted transition-colors"
                >
                  Sair
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TopBar
