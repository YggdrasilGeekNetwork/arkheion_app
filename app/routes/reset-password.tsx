import type { MetaFunction, ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { Form, Link, useActionData, useLoaderData, useNavigation } from "@remix-run/react"
import { json } from "@remix-run/node"
import { gqlRequest } from "~/utils/graphql.server"
import { createUserSession } from "~/utils/session.server"
import { RESET_PASSWORD_MUTATION } from "~/graphql/auth"

export const meta: MetaFunction = () => [
  { title: "Redefinir senha - Arkheion" },
]

interface ResetPayload {
  resetPassword: {
    user: { id: string } | null
    accessToken: string | null
    refreshToken: string | null
    errors: string[] | null
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const token = url.searchParams.get("token") ?? ""
  if (!token) {
    return json({ token: "", missingToken: true })
  }
  return json({ token, missingToken: false })
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const token = formData.get("token") as string
  const password = formData.get("password") as string
  const passwordConfirmation = formData.get("passwordConfirmation") as string

  if (!token) {
    return json({ error: "Token inválido ou ausente" }, { status: 400 })
  }

  if (!password || !passwordConfirmation) {
    return json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
  }

  if (password !== passwordConfirmation) {
    return json({ error: "As senhas não coincidem" }, { status: 400 })
  }

  if (password.length < 8) {
    return json({ error: "A senha deve ter pelo menos 8 caracteres" }, { status: 400 })
  }

  let result: Awaited<ReturnType<typeof gqlRequest<ResetPayload>>>
  try {
    result = await gqlRequest<ResetPayload>(RESET_PASSWORD_MUTATION, {
      token,
      password,
      passwordConfirmation,
    })
  } catch {
    return json({ error: "Serviço indisponível. Tente novamente mais tarde." }, { status: 503 })
  }

  if (result.errors?.length) {
    return json({ error: result.errors[0].message }, { status: 500 })
  }

  const payload = result.data?.resetPassword
  if (payload?.errors?.length) {
    return json({ error: payload.errors[0] }, { status: 400 })
  }

  if (!payload?.accessToken || !payload?.refreshToken) {
    return json({ error: "Erro inesperado. Tente novamente." }, { status: 500 })
  }

  return createUserSession({
    request,
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    redirectTo: "/characters",
  })
}

export default function ResetPassword() {
  const { token, missingToken } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"

  if (missingToken) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl font-bold text-accent mb-4">ARKHEION</h1>
        <p className="text-muted mb-4">Link de redefinição inválido ou expirado.</p>
        <Link to="/forgot-password" className="text-accent hover:underline font-semibold">
          Solicitar novo link
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-accent mb-2">ARKHEION</h1>
        <p className="text-muted">Redefinir senha</p>
      </div>

      <div className="bg-card border border-stroke rounded-lg p-6">
        <Form method="post" className="space-y-4">
          <input type="hidden" name="token" value={token} />

          <div>
            <label htmlFor="password" className="block text-sm font-semibold mb-1">
              Nova senha
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              minLength={8}
              className="w-full px-3 py-2 bg-card-muted border border-stroke rounded focus:outline-none focus:border-accent"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="passwordConfirmation" className="block text-sm font-semibold mb-1">
              Confirmar nova senha
            </label>
            <input
              type="password"
              id="passwordConfirmation"
              name="passwordConfirmation"
              required
              minLength={8}
              className="w-full px-3 py-2 bg-card-muted border border-stroke rounded focus:outline-none focus:border-accent"
              placeholder="••••••••"
            />
          </div>

          {actionData?.error && (
            <div className="bg-red-600 bg-opacity-10 border border-red-600 rounded p-3 text-sm text-red-600">
              {actionData.error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 bg-accent text-card rounded hover:bg-accent-hover transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Redefinindo..." : "Redefinir senha"}
          </button>
        </Form>
      </div>
    </div>
  )
}
