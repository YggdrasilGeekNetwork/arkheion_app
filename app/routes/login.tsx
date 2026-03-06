import type { MetaFunction, ActionFunctionArgs } from "@remix-run/node"
import { Form, Link, useActionData, useNavigation } from "@remix-run/react"
import { json } from "@remix-run/node"
import { gqlRequest } from "~/utils/graphql.server"
import { createUserSession } from "~/utils/session.server"
import { LOGIN_MUTATION } from "~/graphql/auth"

export const meta: MetaFunction = () => {
  return [
    { title: "Login - Arkheion" },
    { name: "description", content: "Faça login no Arkheion" },
  ]
}

interface LoginPayload {
  user: { id: string; email: string; username: string; displayName: string | null }
  accessToken: string | null
  refreshToken: string | null
  errors: string[] | null
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return json({ error: "Email e senha são obrigatórios" }, { status: 400 })
  }

  let result: Awaited<ReturnType<typeof gqlRequest<{ login: LoginPayload }>>>
  try {
    result = await gqlRequest<{ login: LoginPayload }>(LOGIN_MUTATION, { email, password })
  } catch {
    return json({ error: "Serviço indisponível. Tente novamente mais tarde." }, { status: 503 })
  }

  if (result.errors?.length) {
    return json({ error: result.errors[0].message }, { status: 500 })
  }

  const payload = result.data?.login
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

export default function Login() {
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-accent mb-2">ARKHEION</h1>
        <p className="text-muted">Faça login para continuar</p>
      </div>

      <div className="bg-card border border-stroke rounded-lg p-6">
        <Form method="post" className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-3 py-2 bg-card-muted border border-stroke rounded focus:outline-none focus:border-accent"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold mb-1">
              Senha
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
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
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </Form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted">Não tem uma conta? </span>
          <Link to="/signup" className="text-accent hover:underline font-semibold">
            Cadastre-se
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link to="/home" className="text-muted hover:text-text text-sm">
            ← Voltar para home
          </Link>
        </div>
      </div>
    </div>
  )
}
