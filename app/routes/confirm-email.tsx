import type { MetaFunction, ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { Link, useLoaderData, useFetcher } from "@remix-run/react"
import { useEffect } from "react"
import { json } from "@remix-run/node"
import { gqlRequest } from "~/utils/graphql.server"
import { createUserSession } from "~/utils/session.server"
import { CONFIRM_EMAIL_MUTATION } from "~/graphql/auth"

export const meta: MetaFunction = () => [
  { title: "Confirmar email - Arkheion" },
]

interface ConfirmPayload {
  confirmEmail: {
    user: { id: string } | null
    accessToken: string | null
    refreshToken: string | null
    errors: string[] | null
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const token = url.searchParams.get("token") ?? ""
  return json({ token })
}

// The action is called by useFetcher on mount
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const token = formData.get("token") as string

  if (!token) {
    return json({ error: "Token inválido ou ausente", success: false })
  }

  let result: Awaited<ReturnType<typeof gqlRequest<ConfirmPayload>>>
  try {
    result = await gqlRequest<ConfirmPayload>(CONFIRM_EMAIL_MUTATION, { token })
  } catch {
    return json({ error: "Serviço indisponível. Tente novamente.", success: false })
  }

  if (result.errors?.length) {
    return json({ error: result.errors[0].message, success: false })
  }

  const payload = result.data?.confirmEmail
  if (payload?.errors?.length) {
    return json({ error: payload.errors[0], success: false })
  }

  if (!payload?.accessToken || !payload?.refreshToken) {
    return json({ error: "Erro inesperado.", success: false })
  }

  return createUserSession({
    request,
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    redirectTo: "/characters",
  })
}

export default function ConfirmEmail() {
  const { token } = useLoaderData<typeof loader>()
  const fetcher = useFetcher<typeof action>()

  // Auto-confirm on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (token && fetcher.state === "idle" && !fetcher.data) {
      const form = new FormData()
      form.set("token", token)
      fetcher.submit(form, { method: "post", action: "/confirm-email" })
    }
  }, [token]) // intentionally omitting fetcher to avoid infinite loops

  const isLoading = fetcher.state !== "idle" || (!fetcher.data && !!token)
  const error = fetcher.data && "error" in fetcher.data ? (fetcher.data as { error: string }).error : null

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 text-center">
      <h1 className="text-4xl font-bold text-accent mb-4">ARKHEION</h1>

      {!token && (
        <div>
          <p className="text-muted mb-4">Link de confirmação inválido.</p>
          <Link to="/login" className="text-accent hover:underline font-semibold">
            Ir para o login
          </Link>
        </div>
      )}

      {token && isLoading && (
        <p className="text-muted">Confirmando seu email...</p>
      )}

      {error && (
        <div>
          <div className="bg-red-600 bg-opacity-10 border border-red-600 rounded p-3 text-sm text-red-600 mb-4">
            {error}
          </div>
          <Link to="/login" className="text-accent hover:underline font-semibold text-sm">
            Ir para o login
          </Link>
        </div>
      )}
    </div>
  )
}
