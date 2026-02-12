import { useState } from 'react'
import { T20_RACES, generateName } from '~/data/t20Names'
import type { T20Race } from '~/data/t20Names'

export default function NameGeneratorTab() {
  const [selectedRace, setSelectedRace] = useState<T20Race | null>(null)
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [includeSurname, setIncludeSurname] = useState(false)
  const [generatedName, setGeneratedName] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  function handleGenerate() {
    if (!selectedRace) return
    const hasGender = selectedRace.names.male || selectedRace.names.female
    const g = hasGender ? gender : undefined
    setGeneratedName(generateName(selectedRace, g, includeSurname))
  }

  function handleCopy() {
    if (!generatedName) return
    navigator.clipboard.writeText(generatedName)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const hasGender = selectedRace && (selectedRace.names.male || selectedRace.names.female) && !selectedRace.names.unisex
  const hasSurnames = selectedRace && selectedRace.surnames && selectedRace.surnames.length > 0

  return (
    <div className="flex flex-col h-full overflow-hidden gap-2">
      {/* Race grid */}
      <div className="grid grid-cols-4 gap-1 flex-shrink-0">
        {T20_RACES.map(race => (
          <button
            key={race.id}
            onClick={() => { setSelectedRace(race); setGeneratedName(null) }}
            className={`flex items-center gap-1 px-1.5 py-1 rounded text-[10px] transition-colors
              ${selectedRace?.id === race.id
                ? 'bg-accent/15 border border-accent/40 text-accent'
                : 'bg-surface/50 border border-stroke text-muted hover:border-accent/20 hover:text-fg'
              }`}
          >
            <span>{race.icon}</span>
            <span className="truncate">{race.name}</span>
          </button>
        ))}
      </div>

      {/* Controls */}
      {selectedRace && (
        <div className="space-y-1.5 flex-shrink-0">
          <div className="flex items-center gap-2">
            {/* Gender toggle */}
            {hasGender && (
              <div className="flex gap-0.5">
                <button
                  onClick={() => setGender('male')}
                  className={`px-2 py-0.5 rounded text-[10px] transition-colors
                    ${gender === 'male'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : 'bg-surface/50 text-muted border border-stroke'
                    }`}
                >
                  Masc.
                </button>
                <button
                  onClick={() => setGender('female')}
                  className={`px-2 py-0.5 rounded text-[10px] transition-colors
                    ${gender === 'female'
                      ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                      : 'bg-surface/50 text-muted border border-stroke'
                    }`}
                >
                  Fem.
                </button>
              </div>
            )}

            {/* Surname checkbox */}
            {hasSurnames && (
              <label className="flex items-center gap-1 text-[10px] text-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSurname}
                  onChange={e => setIncludeSurname(e.target.checked)}
                  className="w-3 h-3 rounded accent-accent"
                />
                Sobrenome
              </label>
            )}
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            className="w-full px-3 py-1.5 rounded-md text-xs font-medium
              bg-accent/15 border border-accent/40 text-accent
              hover:bg-accent/25 transition-colors"
          >
            Gerar Nome
          </button>
        </div>
      )}

      {/* Result */}
      {generatedName && (
        <div className="flex items-center gap-2 px-3 py-2 bg-surface/50 border border-stroke rounded-md flex-shrink-0">
          <span className="text-sm font-semibold text-fg flex-1">{generatedName}</span>
          <button
            onClick={handleCopy}
            className="text-xs text-muted hover:text-accent transition-colors flex-shrink-0"
          >
            {copied ? '✓ Copiado!' : '📋 Copiar'}
          </button>
        </div>
      )}

      {/* History - keep generating */}
      {selectedRace && generatedName && (
        <div className="flex-1 overflow-y-auto">
          <button
            onClick={handleGenerate}
            className="text-[10px] text-accent/60 hover:text-accent transition-colors"
          >
            Gerar outro nome
          </button>
        </div>
      )}

      {/* Empty state */}
      {!selectedRace && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl opacity-30 mb-1">📛</div>
            <div className="text-[10px] text-muted/60">Selecione uma raça</div>
          </div>
        </div>
      )}
    </div>
  )
}
