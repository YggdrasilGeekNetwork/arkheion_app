import { useWizard } from '~/contexts/WizardContext'

export default function OriginStep() {
  const { state, dispatch, loaderData } = useWizard()
  const { origin } = state.data

  const origins = loaderData?.origins || []
  const selectedOriginData = origin ? origins.find(o => o.id === origin.id) : null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Origem</h2>
        <p className="text-sm text-muted">
          Escolha a origem do seu personagem. A origem define o que você fazia antes de se tornar um aventureiro.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Origem <span className="text-muted text-xs">(opcional)</span>
        </label>
        <select
          value={origin?.id || ''}
          onChange={(e) => {
            const selectedOrigin = origins.find(o => o.id === e.target.value)
            dispatch({
              type: 'SELECT_ORIGIN',
              payload: selectedOrigin ? { id: selectedOrigin.id, name: selectedOrigin.name } : null,
            })
          }}
          className="w-full px-3 py-2 bg-card-muted border border-stroke rounded-lg focus:border-accent focus:outline-none"
        >
          <option value="">Nenhuma</option>
          {origins.map(o => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
        {selectedOriginData && (
          <p className="mt-1 text-xs text-muted">{selectedOriginData.description}</p>
        )}
      </div>

      {selectedOriginData && (
        <div className="bg-card-muted border border-stroke rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold">Benefícios da Origem</h3>

          {selectedOriginData.specialNote ? (
            <p className="text-sm text-muted">{selectedOriginData.specialNote}</p>
          ) : (
            <>
              {selectedOriginData.skills.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-muted mb-1">Perícias</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedOriginData.skills.map(skill => (
                      <span key={skill} className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedOriginData.powers.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-muted mb-1">Poderes</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedOriginData.powers.map(power => (
                      <span key={power} className="text-xs bg-card border border-stroke px-2 py-0.5 rounded">
                        {power}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
