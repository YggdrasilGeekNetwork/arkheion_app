import { useWizard } from '~/contexts/WizardContext'
import { InlineChoiceResolver } from '../ChoiceResolver'

function calculateModifier(value: number): number {
  return Math.floor((value - 10) / 2)
}

export default function SkillsStep() {
  const { state, dispatch, loaderData, getChoicesForStep, resolveChoice, getTotalLevel } = useWizard()
  const { trainedSkills, attributes } = state.data
  const { attributeBonuses, skillBonuses } = state.computed

  const allSkills = loaderData?.skills || []
  const skillChoices = getChoicesForStep('skills')
  const totalLevel = getTotalLevel()

  // Group skills by attribute
  const skillsByAttribute = allSkills.reduce((acc, skill) => {
    if (!acc[skill.attribute]) {
      acc[skill.attribute] = []
    }
    acc[skill.attribute].push(skill)
    return acc
  }, {} as Record<string, typeof allSkills>)

  const getAttributeValue = (attr: string): number => {
    const base = attributes[attr as keyof typeof attributes] || 10
    const bonus = attributeBonuses.find(b => b.attribute === attr)?.value || 0
    return base + bonus
  }

  const getSkillModifier = (skill: typeof allSkills[0], isTrained: boolean): number => {
    const attrValue = getAttributeValue(skill.attribute)
    const attrMod = calculateModifier(attrValue)
    const halfLevel = Math.floor(totalLevel / 2)
    const trainBonus = isTrained ? 2 : 0 // Simplified training bonus
    const skillBonus = skillBonuses.find(b => b.skill === skill.name)?.value || 0

    return attrMod + halfLevel + trainBonus + skillBonus
  }

  const handleToggleSkill = (skillName: string) => {
    dispatch({ type: 'TOGGLE_SKILL', payload: skillName })
  }

  // Calculate how many skills can still be trained based on choices
  const getTrainingInfo = () => {
    let totalAllowed = 0
    let requiredFromChoices = 0

    skillChoices.forEach(choice => {
      if (choice.isResolved) {
        totalAllowed += choice.selectedOptions.length
      } else {
        requiredFromChoices += choice.minSelections
      }
    })

    return {
      totalAllowed,
      requiredFromChoices,
      currentlyTrained: trainedSkills.length,
    }
  }

  const trainingInfo = getTrainingInfo()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Perícias</h2>
        <p className="text-sm text-muted">
          Perícias representam as habilidades e conhecimentos do seu personagem.
          Perícias treinadas recebem bônus adicional.
        </p>
      </div>

      {/* Training status */}
      <div className="bg-card-muted border border-stroke rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Perícias Treinadas</span>
          <span className={`font-bold ${
            trainingInfo.currentlyTrained > trainingInfo.totalAllowed
              ? 'text-red-500'
              : 'text-accent'
          }`}>
            {trainingInfo.currentlyTrained}
            {trainingInfo.totalAllowed > 0 && ` / ${trainingInfo.totalAllowed}`}
          </span>
        </div>
        {trainingInfo.requiredFromChoices > 0 && (
          <p className="text-xs text-muted mt-1">
            Resolva as escolhas abaixo para definir quais perícias podem ser treinadas.
          </p>
        )}
      </div>

      {/* Skill Choices from class */}
      {skillChoices.length > 0 && (
        <InlineChoiceResolver
          choices={skillChoices}
          onResolve={resolveChoice}
        />
      )}

      {/* Skills by Attribute */}
      <div className="space-y-4">
        {Object.entries(skillsByAttribute).map(([attr, skills]) => {
          const attrValue = getAttributeValue(attr)
          const attrMod = calculateModifier(attrValue)

          return (
            <div key={attr} className="bg-card border border-stroke rounded-lg overflow-hidden">
              <div className="bg-card-muted px-4 py-2 border-b border-stroke">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{attr}</span>
                  <span className={`text-sm ${attrMod >= 0 ? 'text-accent' : 'text-red-500'}`}>
                    Mod: {attrMod >= 0 ? '+' : ''}{attrMod}
                  </span>
                </div>
              </div>

              <div className="divide-y divide-stroke">
                {skills.map(skill => {
                  const isTrained = trainedSkills.includes(skill.name)
                  const totalMod = getSkillModifier(skill, isTrained)
                  const hasSkillBonus = skillBonuses.some(b => b.skill === skill.name)

                  // Check if this skill is available from choices
                  const isAvailableFromChoice = skillChoices.some(choice =>
                    choice.isResolved && choice.selectedOptions.includes(skill.name)
                  )
                  const canTrain = isAvailableFromChoice || skillChoices.length === 0

                  return (
                    <div
                      key={skill.name}
                      className={`flex items-center gap-3 px-4 py-2 ${
                        isTrained ? 'bg-accent/5' : ''
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleSkill(skill.name)}
                        disabled={!canTrain && !isTrained}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          isTrained
                            ? 'bg-accent border-accent'
                            : canTrain
                            ? 'border-stroke hover:border-accent'
                            : 'border-stroke opacity-50 cursor-not-allowed'
                        }`}
                      >
                        {isTrained && (
                          <svg className="w-3 h-3 text-card" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${isTrained ? 'text-accent' : ''}`}>
                            {skill.name}
                          </span>
                          {hasSkillBonus && (
                            <span className="text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded">
                              Bônus
                            </span>
                          )}
                        </div>
                        {skill.description && (
                          <p className="text-xs text-muted truncate">{skill.description}</p>
                        )}
                      </div>

                      <div className={`text-lg font-bold ${totalMod >= 0 ? 'text-accent' : 'text-red-500'}`}>
                        {totalMod >= 0 ? '+' : ''}{totalMod}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Formula explanation */}
      <div className="bg-card-muted border border-stroke rounded-lg p-3 text-xs text-muted">
        <strong>Cálculo do Modificador:</strong> Modificador do Atributo + Metade do Nível + Bônus de Treinamento (+2 se treinado) + Outros Bônus
      </div>
    </div>
  )
}
