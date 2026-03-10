import { useState } from 'react'
import Card from '~/components/ui/Card'
import type { CharacterSense } from '~/types/character'

export type Sense = CharacterSense

type SensesCardProps = {
  senses: Sense[]
  onSensesVisibilityChange?: (hiddenNames: string[]) => void
}

const SensesCard = ({ senses, onSensesVisibilityChange }: SensesCardProps) => {
  const [editing, setEditing] = useState(false)
  const [hiddenNames, setHiddenNames] = useState<Set<string>>(
    () => new Set(senses.filter(s => !s.visible).map(s => s.name))
  )

  const toggleSense = (name: string) => {
    const next = new Set(hiddenNames)
    if (next.has(name)) next.delete(name)
    else next.add(name)
    setHiddenNames(next)
    onSensesVisibilityChange?.([...next])
  }

  const displaySenses = editing ? senses : senses.filter(s => !hiddenNames.has(s.name))

  return (
    <Card>
      <div className="flex items-center justify-between mb-1 md:mb-1.5">
        <div className="text-sm md:text-base font-semibold">Sentidos</div>
        <button
          onClick={() => setEditing(e => !e)}
          className="text-[10px] md:text-xs text-muted hover:text-accent transition-colors"
        >
          {editing ? 'concluir' : 'editar'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-2 gap-y-1 md:gap-y-1.5">
        {displaySenses.map((sense, index) => {
          const isHidden = hiddenNames.has(sense.name)
          return (
            <div key={index} className="flex justify-between text-sm md:text-base group relative">
              {editing && (
                <button
                  onClick={() => toggleSense(sense.name)}
                  className={`mr-1 shrink-0 text-xs transition-colors ${isHidden ? 'text-muted opacity-40' : 'text-accent'}`}
                  title={isHidden ? 'Exibir' : 'Ocultar'}
                >
                  {isHidden ? '○' : '●'}
                </button>
              )}
              <span className={`truncate ${isHidden ? 'opacity-40 text-muted' : 'text-muted'}`}>
                {sense.name} {sense.tooltip && <span className="opacity-50">?</span>}
              </span>
              <span className={`font-bold ml-1 shrink-0 ${isHidden ? 'opacity-40' : ''}`}>
                {sense.value}
              </span>
              {sense.tooltip && !editing && (
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-card border border-stroke rounded-lg p-2 shadow-lg z-10 w-48">
                  <div className="text-xs">{sense.tooltip}</div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export default SensesCard
