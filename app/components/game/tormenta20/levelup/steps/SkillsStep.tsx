import type { Skill } from '~/types/character'

type SkillsStepProps = {
  availableSkills: string[]
  selectedSkills: string[]
  currentSkills: Skill[]
  maxSelections: number
  onToggleSkill: (skillName: string) => void
}

// All skills in Tormenta 20 with their key attribute
const ALL_SKILLS: { name: string; attribute: string }[] = [
  { name: 'Acrobacia', attribute: 'DES' },
  { name: 'Adestramento', attribute: 'CAR' },
  { name: 'Atletismo', attribute: 'FOR' },
  { name: 'Atuação', attribute: 'CAR' },
  { name: 'Cavalgar', attribute: 'DES' },
  { name: 'Conhecimento', attribute: 'INT' },
  { name: 'Cura', attribute: 'SAB' },
  { name: 'Diplomacia', attribute: 'CAR' },
  { name: 'Enganação', attribute: 'CAR' },
  { name: 'Fortitude', attribute: 'CON' },
  { name: 'Furtividade', attribute: 'DES' },
  { name: 'Guerra', attribute: 'INT' },
  { name: 'Iniciativa', attribute: 'DES' },
  { name: 'Intimidação', attribute: 'CAR' },
  { name: 'Intuição', attribute: 'SAB' },
  { name: 'Investigação', attribute: 'INT' },
  { name: 'Jogatina', attribute: 'CAR' },
  { name: 'Ladinagem', attribute: 'DES' },
  { name: 'Luta', attribute: 'FOR' },
  { name: 'Misticismo', attribute: 'INT' },
  { name: 'Nobreza', attribute: 'INT' },
  { name: 'Ofício', attribute: 'INT' },
  { name: 'Percepção', attribute: 'SAB' },
  { name: 'Pilotagem', attribute: 'DES' },
  { name: 'Pontaria', attribute: 'DES' },
  { name: 'Reflexos', attribute: 'DES' },
  { name: 'Religião', attribute: 'SAB' },
  { name: 'Sobrevivência', attribute: 'SAB' },
  { name: 'Vontade', attribute: 'SAB' },
]

export default function SkillsStep({
  availableSkills,
  selectedSkills,
  currentSkills,
  maxSelections,
  onToggleSkill,
}: SkillsStepProps) {
  const isSelected = (skillName: string) => selectedSkills.includes(skillName)
  const isTrained = (skillName: string) =>
    currentSkills.some(s => s.name === skillName && s.trained)
  const canSelectMore = selectedSkills.length < maxSelections

  // Filter to show only available skills, or all if none specified
  const skillsToShow = availableSkills.length > 0
    ? ALL_SKILLS.filter(s => availableSkills.includes(s.name))
    : ALL_SKILLS

  // Group by attribute
  const skillsByAttribute = skillsToShow.reduce((acc, skill) => {
    if (!acc[skill.attribute]) {
      acc[skill.attribute] = []
    }
    acc[skill.attribute].push(skill)
    return acc
  }, {} as Record<string, typeof ALL_SKILLS>)

  if (maxSelections === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Perícias</h3>
        </div>

        <div className="p-8 text-center border border-dashed border-stroke rounded-lg">
          <div className="text-4xl mb-2 opacity-50">📖</div>
          <p className="text-muted">
            Nenhuma perícia adicional para treinar neste nível.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Perícias</h3>
        <p className="text-sm text-muted mb-4">
          Escolha {maxSelections} perícia(s) para treinar.
          <span className="ml-2 text-accent">
            ({selectedSkills.length}/{maxSelections})
          </span>
        </p>
      </div>

      <div className="space-y-4">
        {Object.entries(skillsByAttribute).map(([attribute, skills]) => (
          <div key={attribute}>
            <div className="text-xs font-semibold text-muted mb-2">{attribute}</div>
            <div className="grid grid-cols-2 gap-2">
              {skills.map(skill => {
                const trained = isTrained(skill.name)
                const selected = isSelected(skill.name)
                const disabled = trained || (!selected && !canSelectMore)

                return (
                  <button
                    key={skill.name}
                    onClick={() => !trained && onToggleSkill(skill.name)}
                    disabled={disabled}
                    className={`p-2 rounded-lg border text-left text-sm transition-all ${
                      trained
                        ? 'border-green-500/30 bg-green-500/10 opacity-50 cursor-not-allowed'
                        : selected
                        ? 'border-accent bg-accent/10'
                        : disabled
                        ? 'border-stroke bg-card opacity-50 cursor-not-allowed'
                        : 'border-stroke bg-card hover:border-accent/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{skill.name}</span>
                      {trained && (
                        <span className="text-[10px] text-green-400">Treinado</span>
                      )}
                      {selected && !trained && (
                        <span className="text-accent">✓</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedSkills.length > 0 && (
        <div className="mt-4 p-3 bg-accent/10 border border-accent/30 rounded-lg">
          <div className="text-sm">
            <strong>Perícias selecionadas:</strong>{' '}
            {selectedSkills.join(', ')}
          </div>
        </div>
      )}
    </div>
  )
}
