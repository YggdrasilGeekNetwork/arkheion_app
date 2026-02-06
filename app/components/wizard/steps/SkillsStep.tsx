import { useEffect } from 'react'
import { useWizard } from '~/contexts/WizardContext'
import { InlineChoiceResolver } from '../ChoiceResolver'

// In Tormenta 20, attributes ARE modifiers, so this is just for display formatting
function formatModifier(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`
}

export default function SkillsStep() {
  const { state, dispatch, loaderData, getChoicesForStep, resolveChoice, getTotalLevel } = useWizard()
  const { trainedSkills, attributes } = state.data
  const { attributeBonuses, skillBonuses } = state.computed

  const allSkills = loaderData?.skills || []
  const skillChoices = getChoicesForStep('skills')
  const totalLevel = getTotalLevel()

  // Sync trainedSkills with resolved skill choices
  // When a skill choice is resolved, those skills should automatically be trained
  useEffect(() => {
    const skillsFromChoices: string[] = []
    skillChoices.forEach(choice => {
      if (choice.isResolved) {
        choice.selectedOptions.forEach(skill => {
          if (!skillsFromChoices.includes(skill)) {
            skillsFromChoices.push(skill)
          }
        })
      }
    })

    // Only update if there's a difference
    const sortedFromChoices = [...skillsFromChoices].sort()
    const sortedTrainedSkills = [...trainedSkills].sort()

    if (JSON.stringify(sortedFromChoices) !== JSON.stringify(sortedTrainedSkills)) {
      dispatch({ type: 'SET_TRAINED_SKILLS', payload: skillsFromChoices })
    }
  }, [skillChoices, dispatch]) // Intentionally not including trainedSkills to avoid loops

  // Group skills by attribute
  const skillsByAttribute = allSkills.reduce((acc, skill) => {
    if (!acc[skill.attribute]) {
      acc[skill.attribute] = []
    }
    acc[skill.attribute].push(skill)
    return acc
  }, {} as Record<string, typeof allSkills>)

  // In Tormenta 20, attributes ARE modifiers, so we just get the final value
  const getAttributeModifier = (attr: string): number => {
    const base = attributes[attr as keyof typeof attributes] || 0
    const bonus = attributeBonuses.find(b => b.attribute === attr)?.value || 0
    return base + bonus
  }

  const getSkillModifier = (skill: typeof allSkills[0], isTrained: boolean): number => {
    // In Tormenta 20: Mod Atributo + Metade do Nível + Treinamento (+2) + Bônus
    const attrMod = getAttributeModifier(skill.attribute)
    const halfLevel = Math.floor(totalLevel / 2)
    const trainBonus = isTrained ? 2 : 0
    const skillBonus = skillBonuses.find(b => b.skill === skill.name)?.value || 0

    return attrMod + halfLevel + trainBonus + skillBonus
  }

  // Calculate training info from choices
  const getTrainingInfo = () => {
    let totalAllowed = 0
    let requiredFromChoices = 0

    skillChoices.forEach(choice => {
      if (choice.isResolved) {
        totalAllowed += choice.maxSelections
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
            trainingInfo.currentlyTrained === trainingInfo.totalAllowed
              ? 'text-accent'
              : trainingInfo.requiredFromChoices > 0
              ? 'text-yellow-500'
              : 'text-muted'
          }`}>
            {trainingInfo.currentlyTrained}
            {trainingInfo.totalAllowed > 0 && ` / ${trainingInfo.totalAllowed}`}
          </span>
        </div>
        {trainingInfo.requiredFromChoices > 0 && (
          <p className="text-xs text-yellow-500 mt-1">
            Escolha suas perícias abaixo para treinar.
          </p>
        )}
        {skillChoices.length === 0 && (
          <p className="text-xs text-muted mt-1">
            Selecione uma classe para escolher perícias treinadas.
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
          // In Tormenta 20, attributes ARE modifiers
          const attrMod = getAttributeModifier(attr)

          return (
            <div key={attr} className="bg-card border border-stroke rounded-lg overflow-hidden">
              <div className="bg-card-muted px-4 py-2 border-b border-stroke">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{attr}</span>
                  <span className={`text-sm ${attrMod >= 0 ? 'text-accent' : 'text-red-500'}`}>
                    Mod: {formatModifier(attrMod)}
                  </span>
                </div>
              </div>

              <div className="divide-y divide-stroke">
                {skills.map(skill => {
                  const isTrained = trainedSkills.includes(skill.name)
                  const totalMod = getSkillModifier(skill, isTrained)
                  const hasSkillBonus = skillBonuses.some(b => b.skill === skill.name)

                  return (
                    <div
                      key={skill.name}
                      className={`flex items-center gap-3 px-4 py-2 ${
                        isTrained ? 'bg-accent/5' : ''
                      }`}
                    >
                      {/* Training indicator (read-only) */}
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isTrained
                            ? 'bg-accent border-accent'
                            : 'border-stroke'
                        }`}
                      >
                        {isTrained && (
                          <svg className="w-3 h-3 text-card" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${isTrained ? 'text-accent' : ''}`}>
                            {skill.name}
                          </span>
                          {isTrained && (
                            <span className="text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded">
                              Treinada
                            </span>
                          )}
                          {hasSkillBonus && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                              +Bônus
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
      <div className="bg-card-muted border border-stroke rounded-lg p-3 text-xs text-muted space-y-1">
        <p>
          <strong>Cálculo do Modificador:</strong> Mod. Atributo + Metade do Nível + Treinamento (+2) + Bônus
        </p>
        <p>
          <strong>Nota:</strong> As perícias que você pode treinar são determinadas pela sua classe.
          Selecione-as na seção de escolhas acima.
        </p>
      </div>
    </div>
  )
}
