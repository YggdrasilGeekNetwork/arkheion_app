import { useState } from 'react'
import { useWizard } from '~/contexts/WizardContext'
import { InlineChoiceResolver } from '../ChoiceResolver'

export default function ClassStep() {
  const { state, dispatch, loaderData, addClass, removeClass, getChoicesForStep, resolveChoice, getTotalLevel } = useWizard()
  const { classes: selectedClasses } = state.data

  const allClasses = loaderData?.classes || []
  const classChoices = getChoicesForStep('class')
  const totalLevel = getTotalLevel()

  // Track which class is being previewed (not yet added)
  const [previewingClassId, setPreviewingClassId] = useState<string | null>(null)

  const previewingClass = previewingClassId ? allClasses.find(c => c.id === previewingClassId) : null

  const handlePreviewClass = (classId: string) => {
    // If already previewing this class, close preview
    if (previewingClassId === classId) {
      setPreviewingClassId(null)
    } else {
      setPreviewingClassId(classId)
    }
  }

  const handleAddPreviewedClass = () => {
    if (previewingClass && !selectedClasses.find(c => c.id === previewingClass.id)) {
      addClass(previewingClass, 1)
      setPreviewingClassId(null)
    }
  }

  const handleRemoveClass = (classId: string) => {
    removeClass(classId)
  }

  const handleLevelChange = (classId: string, level: number) => {
    dispatch({ type: 'UPDATE_CLASS_LEVEL', payload: { classId, level } })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Escolha sua Classe</h2>
        <p className="text-sm text-muted">
          A classe define o papel do seu personagem em combate e suas habilidades principais.
          Você pode escolher mais de uma classe para criar um personagem multiclasse.
        </p>
      </div>

      {/* Selected Classes Summary */}
      {selectedClasses.length > 0 && (
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Classes Selecionadas</h3>
            <span className="text-sm text-accent">Nível Total: {totalLevel}</span>
          </div>
          <div className="space-y-2">
            {selectedClasses.map(cls => {
              const classData = allClasses.find(c => c.id === cls.id)
              return (
                <div key={cls.id} className="flex items-center gap-3 bg-card border border-stroke rounded-lg p-3">
                  <div className="flex-1">
                    <span className="font-medium">{cls.name}</span>
                    {classData && (
                      <span className="text-xs text-muted ml-2">
                        (d{classData.hitDie} PV)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm text-muted">Nível:</label>
                    <select
                      value={cls.level}
                      onChange={(e) => handleLevelChange(cls.id, parseInt(e.target.value))}
                      className="w-16 px-2 py-1 bg-card-muted border border-stroke rounded focus:border-accent focus:outline-none text-sm"
                    >
                      {Array.from({ length: 20 }, (_, i) => i + 1).map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => handleRemoveClass(cls.id)}
                      className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Available Classes Grid */}
      <div>
        <h3 className="text-sm font-medium text-muted mb-3">
          {selectedClasses.length > 0 ? 'Adicionar outra classe (multiclasse)' : 'Selecione uma classe para ver detalhes'}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {allClasses.map(cls => {
            const isSelected = selectedClasses.some(c => c.id === cls.id)
            const isPreviewing = previewingClassId === cls.id

            return (
              <button
                key={cls.id}
                type="button"
                onClick={() => !isSelected && handlePreviewClass(cls.id)}
                disabled={isSelected}
                className={`text-left p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-accent/50 bg-accent/5 opacity-60 cursor-not-allowed'
                    : isPreviewing
                    ? 'border-accent bg-accent/10'
                    : 'border-stroke bg-card hover:border-accent/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-card-muted flex items-center justify-center text-2xl flex-shrink-0">
                    {cls.name === 'Guerreiro' && '⚔️'}
                    {cls.name === 'Arcanista' && '🔮'}
                    {cls.name === 'Clérigo' && '✝️'}
                    {cls.name === 'Ladino' && '🗡️'}
                    {!['Guerreiro', 'Arcanista', 'Clérigo', 'Ladino'].includes(cls.name) && '🎭'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{cls.name}</h3>
                      {isSelected && (
                        <span className="text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded">
                          Selecionada
                        </span>
                      )}
                      {isPreviewing && !isSelected && (
                        <span className="text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded">
                          Visualizando
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted line-clamp-2">{cls.description}</p>

                    {/* Class info */}
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="bg-card-muted px-1.5 py-0.5 rounded">
                        d{cls.hitDie} PV
                      </span>
                      <span className="bg-card-muted px-1.5 py-0.5 rounded">
                        {cls.primaryAttributes.join('/')}
                      </span>
                      {cls.spellcasting && (
                        <span className="bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">
                          Conjurador
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Previewing Class Details - shown when a class is being previewed but not yet added */}
      {previewingClass && !selectedClasses.some(c => c.id === previewingClass.id) && (
        <div className="bg-card border-2 border-accent rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Detalhes: {previewingClass.name}</h3>
            <button
              type="button"
              onClick={() => setPreviewingClassId(null)}
              className="p-1 text-muted hover:text-foreground rounded transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-sm text-muted">{previewingClass.description}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Proficiencies */}
            <div>
              <h4 className="text-sm font-medium text-muted mb-2">Proficiências</h4>
              <div className="space-y-1 text-sm">
                {previewingClass.proficiencies.armor.length > 0 && (
                  <div>
                    <span className="text-muted">Armaduras: </span>
                    <span>{previewingClass.proficiencies.armor.join(', ')}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted">Armas: </span>
                  <span>{previewingClass.proficiencies.weapons.join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h4 className="text-sm font-medium text-muted mb-2">Perícias</h4>
              <p className="text-sm">
                Escolha <span className="text-accent font-medium">{previewingClass.skillChoices.count}</span> de:{' '}
                <span className="text-muted">{previewingClass.skillChoices.options.join(', ')}</span>
              </p>
            </div>
          </div>

          {/* Abilities */}
          <div>
            <h4 className="text-sm font-medium text-muted mb-2">Habilidades de Nível 1</h4>
            <div className="space-y-2">
              {previewingClass.abilities
                .filter(a => a.level === 1)
                .map(ability => (
                  <div key={ability.id} className="bg-card-muted border border-stroke rounded p-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{ability.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        ability.type === 'active' ? 'bg-accent/20 text-accent' : 'bg-card-muted text-muted'
                      }`}>
                        {ability.type === 'active' ? 'Ativa' : 'Passiva'}
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-1">{ability.description}</p>
                  </div>
                ))}
            </div>
          </div>

          {/* Add Class Button */}
          <button
            type="button"
            onClick={handleAddPreviewedClass}
            className="w-full py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors"
          >
            Adicionar {previewingClass.name}
          </button>
        </div>
      )}

      {/* Selected Class Details (for already added classes) */}
      {selectedClasses.length === 1 && !previewingClass && (
        <div className="bg-card-muted border border-stroke rounded-lg p-4 space-y-4">
          {(() => {
            const classData = allClasses.find(c => c.id === selectedClasses[0].id)
            if (!classData) return null

            const currentLevel = selectedClasses[0].level

            return (
              <>
                <h3 className="font-semibold">Detalhes: {classData.name}</h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Proficiencies */}
                  <div>
                    <h4 className="text-sm font-medium text-muted mb-2">Proficiências</h4>
                    <div className="space-y-1 text-sm">
                      {classData.proficiencies.armor.length > 0 && (
                        <div>
                          <span className="text-muted">Armaduras: </span>
                          <span>{classData.proficiencies.armor.join(', ')}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-muted">Armas: </span>
                        <span>{classData.proficiencies.weapons.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <h4 className="text-sm font-medium text-muted mb-2">Perícias</h4>
                    <p className="text-sm">
                      Escolha <span className="text-accent font-medium">{classData.skillChoices.count}</span> de:{' '}
                      <span className="text-muted">{classData.skillChoices.options.join(', ')}</span>
                    </p>
                  </div>
                </div>

                {/* Abilities */}
                <div>
                  <h4 className="text-sm font-medium text-muted mb-2">Habilidades até Nível {currentLevel}</h4>
                  <div className="space-y-2">
                    {classData.abilities
                      .filter(a => a.level <= currentLevel)
                      .map(ability => (
                        <div key={ability.id} className="bg-card border border-stroke rounded p-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{ability.name}</span>
                            <span className="text-xs text-muted">Nv. {ability.level}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              ability.type === 'active' ? 'bg-accent/20 text-accent' : 'bg-card-muted text-muted'
                            }`}>
                              {ability.type === 'active' ? 'Ativa' : 'Passiva'}
                            </span>
                          </div>
                          <p className="text-xs text-muted mt-1">{ability.description}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )
          })()}
        </div>
      )}

      {/* Class Choices */}
      {classChoices.length > 0 && (
        <InlineChoiceResolver
          choices={classChoices}
          onResolve={resolveChoice}
        />
      )}
    </div>
  )
}
