import { useState, useMemo } from 'react'
import type { Skill, Attribute, CharacterClass } from '~/types/character'
import Tooltip from '~/components/ui/Tooltip'
import Modal from '~/components/ui/Modal'
import Rollable from './Rollable'
import { TORMENTA20_SKILLS } from '~/data/tormenta20Skills'
import { getTotalLevel, getTrainingBonus, getHalfLevelBonus } from '~/utils/tormenta20'

type SkillsCardProps = {
  skills: Skill[]
  attributes: Attribute[]
  classes: CharacterClass[]
  onSkillsChange: (skills: Skill[]) => void
  mode: 'summary' | 'combat'
  title?: string
  modalTitle?: string
}

export default function SkillsCard({
  skills,
  attributes,
  classes,
  onSkillsChange,
  mode,
  title = 'Perícias',
  modalTitle,
}: SkillsCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const characterLevel = getTotalLevel(classes)
  const visibilityKey = mode === 'summary' ? 'visibleInSummary' : 'visibleInCombat'
  const finalModalTitle = modalTitle || (mode === 'combat' ? 'Perícias de Combate' : 'Perícias')

  const allSkills = useMemo(() => {
    return TORMENTA20_SKILLS.map(skillDef => {
      const characterSkill = skills.find(s => s.name === skillDef.name)
      const attribute = attributes.find(a => a.label === skillDef.attribute)
      const attributeModifier = attribute?.modifier || 0

      if (characterSkill) {
        return characterSkill
      } else {
        return {
          name: skillDef.name,
          modifier: attributeModifier,
          trained: false,
          attribute: skillDef.attribute,
          tooltip: skillDef.tooltip,
          visibleInSummary: false,
          visibleInCombat: false,
        }
      }
    })
  }, [skills, attributes])

  const visibleSkills = allSkills.filter(s => s[visibilityKey])

  const getSkillTotal = (skill: Skill) => {
    const attribute = attributes.find(a => a.label === skill.attribute)
    const attributeModifier = attribute?.modifier || 0
    const levelBonus = getHalfLevelBonus(characterLevel)
    const trainingBonus = skill.trained ? getTrainingBonus(characterLevel) : 0
    const otherBonuses = skill.otherBonuses || []
    const otherTotal = otherBonuses.reduce((sum: number, bonus: { label: string; value: number }) => sum + bonus.value, 0)

    return {
      attributeModifier,
      levelBonus,
      trainingBonus,
      otherBonuses,
      otherTotal,
      total: attributeModifier + levelBonus + trainingBonus + otherTotal
    }
  }

  const handleToggleSkill = (skillName: string) => {
    const existingIndex = skills.findIndex(s => s.name === skillName)
    const skillDef = TORMENTA20_SKILLS.find(s => s.name === skillName)

    if (existingIndex !== -1) {
      const newSkills = [...skills]
      newSkills[existingIndex] = {
        ...newSkills[existingIndex],
        [visibilityKey]: !newSkills[existingIndex][visibilityKey]
      }
      onSkillsChange(newSkills)
    } else if (skillDef) {
      const attribute = attributes.find(a => a.label === skillDef.attribute)
      const newSkill: Skill = {
        name: skillDef.name,
        modifier: attribute?.modifier || 0,
        trained: false,
        attribute: skillDef.attribute,
        tooltip: skillDef.tooltip,
        visibleInSummary: mode === 'summary',
        visibleInCombat: mode === 'combat',
        levelBonus: 0,
        trainingBonus: 0,
        otherBonuses: [],
      }
      onSkillsChange([...skills, newSkill])
    }
  }

  return (
    <>
      <div className="bg-card border border-stroke rounded-lg p-2">
        <div className="flex items-center justify-between mb-1 md:mb-1.5">
          <div className="text-xs md:text-sm font-bold text-muted">{title}</div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs md:text-sm text-accent hover:underline font-semibold"
          >
            +
          </button>
        </div>

        {visibleSkills.length === 0 ? (
          <div className="text-xs md:text-sm text-muted text-center py-1">
            Nenhuma perícia
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1 md:gap-1.5">
            {visibleSkills.map((skill) => {
              const { total } = getSkillTotal(skill)
              return (
                <Tooltip key={skill.name} content={skill.tooltip || skill.name}>
                  <div className="bg-card-muted border border-stroke rounded px-1.5 py-1 md:py-1.5 hover:border-accent transition-colors cursor-pointer flex items-center justify-between gap-1">
                    <div className="text-[10px] md:text-xs text-muted truncate leading-tight flex-1">
                      {skill.name}
                    </div>
                    <Rollable label={skill.name} modifier={total}>
                      <div className="text-xs md:text-sm font-bold flex-shrink-0">
                        {total >= 0 ? '+' : ''}{total}
                      </div>
                    </Rollable>
                  </div>
                </Tooltip>
              )
            })}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={finalModalTitle}>
        <div className="space-y-1 max-h-[70vh] overflow-y-auto">
          {allSkills.map((skill) => {
            const breakdown = getSkillTotal(skill)
            return (
              <div
                key={skill.name}
                className={mode === 'summary'
                  ? "flex items-center gap-2 bg-card-muted border border-stroke rounded p-2"
                  : "flex items-start gap-2 bg-card-muted border border-stroke rounded p-2"
                }
              >
                <input
                  type="checkbox"
                  checked={skill[visibilityKey] || false}
                  onChange={() => handleToggleSkill(skill.name)}
                  className={mode === 'summary'
                    ? "w-4 h-4 cursor-pointer flex-shrink-0"
                    : "mt-1 w-4 h-4 cursor-pointer"
                  }
                />

                {mode === 'summary' ? (
                  // Summary layout - horizontal inline
                  <>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold mb-0.5">{skill.name}</div>
                      <div className="text-xs text-muted flex flex-wrap gap-x-2 gap-y-0.5">
                        <span>Nível(÷2): {breakdown.levelBonus >= 0 ? '+' : ''}{breakdown.levelBonus}</span>
                        <span>|</span>
                        <span>{skill.attribute}: {breakdown.attributeModifier >= 0 ? '+' : ''}{breakdown.attributeModifier}</span>
                        {skill.trained && (
                          <>
                            <span>|</span>
                            <span>Treino: +{breakdown.trainingBonus}</span>
                          </>
                        )}
                        {breakdown.otherBonuses.length > 0 && (
                          <>
                            <span>|</span>
                            <Tooltip content={
                              <div className="space-y-1">
                                {breakdown.otherBonuses.map((bonus: { label: string; value: number }, i: number) => (
                                  <div key={i} className="flex justify-between gap-2">
                                    <span>{bonus.label}:</span>
                                    <span>{bonus.value >= 0 ? '+' : ''}{bonus.value}</span>
                                  </div>
                                ))}
                              </div>
                            }>
                              <span className="cursor-help">
                                Outros: {breakdown.otherTotal >= 0 ? '+' : ''}{breakdown.otherTotal} <span className="opacity-50">?</span>
                              </span>
                            </Tooltip>
                          </>
                        )}
                      </div>
                    </div>
                    <Rollable label={skill.name} modifier={breakdown.total}>
                      <div className="text-lg font-bold text-accent cursor-pointer flex-shrink-0 hover:scale-110 transition-transform">
                        {breakdown.total >= 0 ? '+' : ''}{breakdown.total}
                      </div>
                    </Rollable>
                  </>
                ) : (
                  // Combat layout - vertical stacked
                  <>
                    <Rollable label={skill.name} modifier={breakdown.total}>
                      <div className="flex-1 cursor-pointer">
                        <div className="text-sm font-semibold">{skill.name}</div>
                        <div className="text-xs text-muted space-y-0.5">
                          <div className="flex justify-between">
                            <span>Nível (÷2):</span>
                            <span>{breakdown.levelBonus >= 0 ? '+' : ''}{breakdown.levelBonus}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{skill.attribute}:</span>
                            <span>{breakdown.attributeModifier >= 0 ? '+' : ''}{breakdown.attributeModifier}</span>
                          </div>
                          {skill.trained && (
                            <div className="flex justify-between">
                              <span>Treino:</span>
                              <span>+{breakdown.trainingBonus}</span>
                            </div>
                          )}
                          {breakdown.otherBonuses.length > 0 && (
                            <Tooltip content={
                              <div className="space-y-1">
                                {breakdown.otherBonuses.map((bonus, i) => (
                                  <div key={i} className="flex justify-between gap-2">
                                    <span>{bonus.label}:</span>
                                    <span>{bonus.value >= 0 ? '+' : ''}{bonus.value}</span>
                                  </div>
                                ))}
                              </div>
                            }>
                              <div className="flex justify-between cursor-help">
                                <span>Outros <span className="opacity-50">?</span>:</span>
                                <span>{breakdown.otherTotal >= 0 ? '+' : ''}{breakdown.otherTotal}</span>
                              </div>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    </Rollable>
                    <div className="text-lg font-bold text-accent self-center">
                      {breakdown.total >= 0 ? '+' : ''}{breakdown.total}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </Modal>
    </>
  )
}
