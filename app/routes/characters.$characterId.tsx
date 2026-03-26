import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node"
import { requireUserToken } from "~/utils/session.server"
import { useLoaderData, useNavigate, useRouteError, isRouteErrorResponse } from "@remix-run/react"
import { json } from "@remix-run/node"
import { useEffect } from "react"
import { CharacterProvider, useCharacter } from "~/contexts/CharacterContext"
import { ToastProvider } from "~/contexts/ToastContext"
import { SocketProvider } from "~/contexts/SocketContext"
import CharacterSheet from "~/components/game/tormenta20/CharacterSheet"
import Toast from "~/components/ui/Toast"
import OfflineWarning from "~/components/ui/OfflineWarning"
import type { Character } from "~/types/character"
import { gqlRequestOrLogout } from "~/utils/graphql.server"
import { GET_CHARACTER_QUERY } from "~/graphql/characters"

export const meta: MetaFunction = () => {
  return [
    { title: "Ficha de Personagem - Arkheion" },
    { name: "description", content: "Visualize e edite sua ficha de personagem" },
  ]
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const token = await requireUserToken(request)
  const characterId = params.characterId

  if (!characterId) {
    throw new Response("Character ID is required", { status: 400 })
  }

  const result = await gqlRequestOrLogout<{ character: Character }>(
    request,
    GET_CHARACTER_QUERY,
    { id: characterId },
    token,
  )

  if (result.errors) {
    const message = result.errors[0]?.message ?? "Personagem não encontrado"
    if (message.toLowerCase().includes("not found")) {
      throw new Response("Personagem não encontrado", { status: 404 })
    }
    throw new Response(message, { status: 500 })
  }

  if (!result.data?.character) {
    throw new Response("Personagem não encontrado", { status: 404 })
  }

  const mesaId: string | undefined = (result.data.character as any).mesaId ?? undefined
  return json({ character: result.data.character, mesaId })
}

function CharacterSheetWrapper() {
  const { character: loadedCharacter, mesaId } = useLoaderData<typeof loader>()
  const { dispatch } = useCharacter()
  const navigate = useNavigate()

  useEffect(() => {
    if (loadedCharacter) {
      dispatch({ type: 'SET_CHARACTER', payload: loadedCharacter })
    }
  }, [loadedCharacter, dispatch])

  const handleBackToCharacters = () => {
    navigate('/characters')
  }

  return (
    <>
      <OfflineWarning />
      <Toast />
      <CharacterSheet onBackToCharacters={handleBackToCharacters} mesaId={mesaId} />
    </>
  )
}

export default function CharacterPage() {
  const { mesaId } = useLoaderData<typeof loader>()

  return (
    <ToastProvider>
      <SocketProvider mesaId={mesaId}>
        <CharacterProvider>
          <CharacterSheetWrapper />
        </CharacterProvider>
      </SocketProvider>
    </ToastProvider>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()

  console.error('ErrorBoundary caught error:', error)

  if (isRouteErrorResponse(error)) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-8">
        <div className="bg-card border border-red-600 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {error.status} {error.statusText}
          </h1>
          <p className="text-muted mb-4">{error.data}</p>
          <a href="/characters" className="text-accent hover:underline">
            ← Voltar para personagens
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8">
      <div className="bg-card border border-red-600 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Erro</h1>
        <p className="text-muted mb-4">
          {error instanceof Error ? error.message : 'Ocorreu um erro inesperado'}
        </p>
        <a href="/characters" className="text-accent hover:underline">
          ← Voltar para personagens
        </a>
      </div>
    </div>
  )
}
