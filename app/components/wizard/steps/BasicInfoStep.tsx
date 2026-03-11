import { useRef, useState } from 'react'
import { useWizard } from '~/contexts/WizardContext'

type UploadState = 'idle' | 'uploading' | 'error'

export default function BasicInfoStep() {
  const { state, dispatch } = useWizard()
  const { name, imageUrl } = state.data

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
        <h2 className="text-xl font-bold mb-2">Toques Finais</h2>
        <p className="text-sm text-muted">
          Escolha o nome e a imagem do seu personagem para finalizar a criação.
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

      </div>
    </div>
  )
}
