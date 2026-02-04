import { useWizard } from '~/contexts/WizardContext'

export default function BasicInfoStep() {
  const { state, dispatch, loaderData } = useWizard()
  const { name, imageUrl, origin } = state.data

  const origins = loaderData?.origins || []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Informações Básicas</h2>
        <p className="text-sm text-muted">
          Defina o nome e as características básicas do seu personagem.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Nome do Personagem <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => dispatch({ type: 'UPDATE_NAME', payload: e.target.value })}
            placeholder="Ex: Thorin Escudo de Ferro"
            className="w-full px-3 py-2 bg-card-muted border border-stroke rounded-lg focus:border-accent focus:outline-none"
          />
        </div>

        {/* Image URL */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            URL da Imagem <span className="text-muted text-xs">(opcional)</span>
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => dispatch({ type: 'UPDATE_IMAGE_URL', payload: e.target.value })}
            placeholder="https://exemplo.com/imagem.jpg"
            className="w-full px-3 py-2 bg-card-muted border border-stroke rounded-lg focus:border-accent focus:outline-none"
          />
          {imageUrl && (
            <div className="mt-2 flex items-center gap-3">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-16 h-16 rounded-lg object-cover border border-stroke"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
              <span className="text-xs text-muted">Preview da imagem</span>
            </div>
          )}
        </div>

        {/* Origin */}
        <div className="md:col-span-2">
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
          {origin && (
            <p className="mt-1 text-xs text-muted">
              {origins.find(o => o.id === origin.id)?.description}
            </p>
          )}
        </div>
      </div>

      {/* Summary */}
      {origin && (
        <div className="bg-card-muted border border-stroke rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-2">Bônus da Origem</h3>
          <div className="text-sm text-muted">
            {origins.find(o => o.id === origin.id)?.skillBonuses?.map(bonus => (
              <span key={bonus.skill} className="inline-block mr-3">
                <span className="text-accent">+{bonus.value}</span> {bonus.skill}
              </span>
            ))}
            {origins.find(o => o.id === origin.id)?.startingGold && (
              <span className="inline-block">
                <span className="text-accent">{origins.find(o => o.id === origin.id)?.startingGold}</span> TO inicial
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
