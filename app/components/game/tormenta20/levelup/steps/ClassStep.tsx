import { useState } from 'react'
import type { CharacterClass, Attribute } from '~/types/character'
import {
  CLASS_INFO,
  rollHitDie,
  calculateHpGained,
  calculateMpGained,
} from '~/types/levelup'
import { getTotalLevel } from '~/utils/tormenta20'

type ClassStepProps = {
  classes: CharacterClass[]
  attributes: Attribute[]
  selectedClassId: string | null
  isNewClass: boolean
  hpRoll: number | null
  onSelectClass: (classId: string | null, isNew: boolean) => void
  onRollHp: (roll: number) => void
}

export default function ClassStep({
  classes,
  attributes,
  selectedClassId,
  isNewClass,
  hpRoll,
  onSelectClass,
  onRollHp,
}: ClassStepProps) {
  const [showNewClassInput, setShowNewClassInput] = useState(false)
  const [newClassName, setNewClassName] = useState('')

  const conAttribute = attributes.find(a => a.label === 'CON')
  const conModifier = conAttribute?.modifier ?? 0
  const currentTotalLevel = getTotalLevel(classes)

  const handleClassSelect = (classId: string) => {
    onSelectClass(classId, false)
    // Auto-roll HP when class is selected
    const selectedClass = classes.find(c => c.name === classId)
    if (selectedClass) {
      const classInfo = CLASS_INFO[selectedClass.name]
      if (classInfo) {
        const roll = rollHitDie(classInfo.hitDie)
        onRollHp(roll)
      }
    }
  }

  const handleNewClass = (className: string) => {
    if (className && CLASS_INFO[className]) {
      onSelectClass(className, true)
      const classInfo = CLASS_INFO[className]
      const roll = rollHitDie(classInfo.hitDie)
      onRollHp(roll)
      setShowNewClassInput(false)
      setNewClassName('')
    }
  }

  const getClassInfo = () => {
    if (!selectedClassId) return null
    const classInfo = CLASS_INFO[selectedClassId]
    if (!classInfo) return null

    const mpAttribute = attributes.find(a => a.label === classInfo.mpAttribute)
    const mpMod = mpAttribute?.modifier ?? 0

    return {
      ...classInfo,
      mpModifier: mpMod,
      hpGained: hpRoll ? calculateHpGained(hpRoll, conModifier) : 0,
      mpGained: calculateMpGained(selectedClassId, mpMod),
    }
  }

  const selectedClassInfo = getClassInfo()

  const rerollHp = () => {
    if (selectedClassId && CLASS_INFO[selectedClassId]) {
      const roll = rollHitDie(CLASS_INFO[selectedClassId].hitDie)
      onRollHp(roll)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Escolha a Classe</h3>
        <p className="text-sm text-muted mb-4">
          Selecione em qual classe deseja subir de nível (atual: nível {currentTotalLevel})
        </p>
      </div>

      {/* Existing Classes */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-muted">Classes Atuais</div>
        {classes.map(cls => {
          const classInfo = CLASS_INFO[cls.name]
          const isSelected = selectedClassId === cls.name && !isNewClass

          return (
            <button
              key={cls.name}
              onClick={() => handleClassSelect(cls.name)}
              className={`w-full p-3 rounded-lg border text-left transition-colors ${
                isSelected
                  ? 'border-accent bg-accent/10'
                  : 'border-stroke bg-card hover:border-accent/50'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold">{cls.name}</span>
                  <span className="text-muted ml-2">Nível {cls.level}</span>
                </div>
                <div className="text-sm text-muted">
                  {classInfo && `d${classInfo.hitDie} | ${classInfo.mpPerLevel} + ${classInfo.mpAttribute}`}
                </div>
              </div>
              {isSelected && (
                <div className="text-sm text-accent mt-1">
                  → Nível {cls.level + 1}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Add New Class (Multiclass) */}
      <div className="pt-2 border-t border-stroke">
        <div className="text-sm font-medium text-muted mb-2">Multiclasse</div>
        {!showNewClassInput ? (
          <button
            onClick={() => setShowNewClassInput(true)}
            className="w-full p-3 rounded-lg border border-dashed border-stroke hover:border-accent/50 transition-colors text-muted"
          >
            + Adicionar Nova Classe
          </button>
        ) : (
          <div className="space-y-2">
            <select
              value={newClassName}
              onChange={e => setNewClassName(e.target.value)}
              className="w-full p-2 rounded-lg border border-stroke bg-card"
            >
              <option value="">Selecione uma classe...</option>
              {Object.keys(CLASS_INFO)
                .filter(name => !classes.some(c => c.name === name))
                .map(name => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => handleNewClass(newClassName)}
                disabled={!newClassName}
                className="flex-1 px-3 py-2 bg-accent text-card rounded hover:bg-accent-hover disabled:opacity-50 transition-colors"
              >
                Confirmar
              </button>
              <button
                onClick={() => {
                  setShowNewClassInput(false)
                  setNewClassName('')
                }}
                className="px-3 py-2 border border-stroke rounded hover:bg-card-muted transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* HP/MP Preview */}
      {selectedClassInfo && hpRoll && (
        <div className="mt-4 p-4 bg-card-muted rounded-lg border border-stroke">
          <div className="text-sm font-semibold mb-3">Ganhos neste Nível</div>

          <div className="grid grid-cols-2 gap-4">
            {/* HP */}
            <div className="space-y-1">
              <div className="text-xs text-muted">Pontos de Vida</div>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-green-500">
                  +{selectedClassInfo.hpGained}
                </div>
                <button
                  onClick={rerollHp}
                  className="text-xs px-2 py-1 border border-stroke rounded hover:bg-card transition-colors"
                  title="Rolar novamente"
                >
                  🎲 d{selectedClassInfo.hitDie}
                </button>
              </div>
              <div className="text-[10px] text-muted">
                Rolagem: {hpRoll} + CON ({conModifier >= 0 ? '+' : ''}{conModifier})
              </div>
            </div>

            {/* MP */}
            <div className="space-y-1">
              <div className="text-xs text-muted">Pontos de Mana</div>
              <div className="text-2xl font-bold text-blue-500">
                +{selectedClassInfo.mpGained}
              </div>
              <div className="text-[10px] text-muted">
                Base: {selectedClassInfo.mpPerLevel} + {selectedClassInfo.mpAttribute} ({selectedClassInfo.mpModifier >= 0 ? '+' : ''}{selectedClassInfo.mpModifier})
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
