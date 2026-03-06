import { useRef, useState } from 'react'
import { useWizard } from '~/contexts/WizardContext'

type UploadState = 'idle' | 'uploading' | 'error'

export default function BasicInfoStep() {
  const { state, dispatch, loaderData } = useWizard()
  const { name, imageUrl, origin } = state.data

  const origins = loaderData?.origins || []

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadState('uploading')
    setUploadError(null)

    try {
      const form = new FormData()
      form.append('filename', file.name)
      form.append('contentType', file.type)
      form.append('size', String(file.size))

      const res = await fetch('/api/upload-url', { method: 'POST', body: form })
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error ?? 'Falha ao obter URL de upload')
      }

      const { uploadUrl, publicUrl } = json as { uploadUrl: string; publicUrl: string }

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })

      if (!uploadRes.ok) {
        throw new Error('Falha ao enviar imagem para o armazenamento')
      }

      dispatch({ type: 'UPDATE_IMAGE_URL', payload: publicUrl })
      setUploadState('idle')
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Erro desconhecido')
      setUploadState('error')
    }
  }

  function handleRemove() {
    dispatch({ type: 'UPDATE_IMAGE_URL', payload: '' })
    setUploadState('idle')
    setUploadError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

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

        {/* Image upload */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Imagem do Personagem <span className="text-muted text-xs">(opcional)</span>
          </label>

          {imageUrl ? (
            <div className="flex items-center gap-4">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-16 h-16 rounded-lg object-cover border border-stroke"
              />
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted">Imagem selecionada</span>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="text-xs text-red-500 hover:underline text-left"
                >
                  Remover
                </button>
              </div>
            </div>
          ) : (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
                id="character-image-input"
              />
              <label
                htmlFor="character-image-input"
                className={`flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-stroke rounded-lg cursor-pointer hover:border-accent transition-colors text-sm text-muted hover:text-text ${uploadState === 'uploading' ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {uploadState === 'uploading' ? (
                  <>
                    <span className="animate-spin">↻</span>
                    Enviando...
                  </>
                ) : (
                  <>
                    <span>↑</span>
                    Escolher imagem (JPEG, PNG, WebP · máx. 5 MB)
                  </>
                )}
              </label>
            </div>
          )}

          {uploadState === 'error' && uploadError && (
            <p className="mt-1 text-xs text-red-500">{uploadError}</p>
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
