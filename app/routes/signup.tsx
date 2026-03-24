import type { MetaFunction, ActionFunctionArgs } from "@remix-run/node"
import { Form, Link, useActionData, useNavigation, useFetcher } from "@remix-run/react"
import { json } from "@remix-run/node"
import { gqlRequest } from "~/utils/graphql.server"
import { createUserSession } from "~/utils/session.server"
import { REGISTER_MUTATION, OAUTH_GOOGLE_MUTATION } from "~/graphql/auth"
import { GoogleSignInButton } from "~/components/ui/GoogleSignInButton"

export const meta: MetaFunction = () => {
  return [
    { title: "Cadastro - Arkheion" },
    { name: "description", content: "Crie sua conta no Arkheion" },
  ]
}

interface AuthPayload {
  user: { id: string; email: string; username: string; displayName: string | null }
  accessToken: string | null
  refreshToken: string | null
  errors: string[] | null
}

/** Gera um username a partir do email (parte antes do @, sanitizada). */
function usernameFromEmail(email: string): string {
  return email.split("@")[0].replace(/[^a-z0-9]/gi, "_").toLowerCase()
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const intent = formData.get("intent") as string

  if (intent === "google") {
    const idToken = formData.get("idToken") as string
    if (!idToken) {
      return json({ error: "Token do Google ausente" }, { status: 400 })
    }
    let result: Awaited<ReturnType<typeof gqlRequest<{ oauthGoogle: AuthPayload }>>>
    try {
      result = await gqlRequest<{ oauthGoogle: AuthPayload }>(OAUTH_GOOGLE_MUTATION, { idToken })
    } catch {
      return json({ error: "Serviço indisponível. Tente novamente mais tarde." }, { status: 503 })
    }
    if (result.errors?.length) {
      return json({ error: result.errors[0].message }, { status: 500 })
    }
    const payload = result.data?.oauthGoogle
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

  // Default: password registration
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!email || !password || !confirmPassword) {
    return json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
  }

  if (password !== confirmPassword) {
    return json({ error: "As senhas não coincidem" }, { status: 400 })
  }

  if (password.length < 8) {
    return json({ error: "A senha deve ter pelo menos 8 caracteres" }, { status: 400 })
  }

  const username = usernameFromEmail(email)

  let result: Awaited<ReturnType<typeof gqlRequest<{ register: AuthPayload }>>>
  try {
    result = await gqlRequest<{ register: AuthPayload }>(REGISTER_MUTATION, {
      email,
      username,
      password,
      passwordConfirmation: confirmPassword,
    })
  } catch {
    return json({ error: "Serviço indisponível. Tente novamente mais tarde." }, { status: 503 })
  }

  if (result.errors?.length) {
    return json({ error: result.errors[0].message }, { status: 500 })
  }

  const payload = result.data?.register
  if (payload?.errors?.length) {
    return json({ error: payload.errors.join("; ") }, { status: 400 })
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

export default function Signup() {
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const fetcher = useFetcher()
  const isSubmitting = navigation.state === "submitting" || fetcher.state === "submitting"

  function handleGoogleToken(idToken: string) {
    const form = new FormData()
    form.set("intent", "google")
    form.set("idToken", idToken)
    fetcher.submit(form, { method: "post", action: "/signup" })
  }

  const googleError = fetcher.data && "error" in fetcher.data ? (fetcher.data as { error: string }).error : null

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-accent mb-2">ARKHEION</h1>
        <p className="text-muted">Crie sua conta</p>
      </div>

      <div className="bg-card border border-stroke rounded-lg p-6">
        {/* Google Sign-Up */}
        <div className="mb-4">
          <GoogleSignInButton
            label="Cadastrar com Google"
            onToken={handleGoogleToken}
            onError={() => {}}
          />
        </div>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 border-t border-stroke" />
          <span className="text-muted text-xs">ou</span>
          <div className="flex-1 border-t border-stroke" />
        </div>

        <Form method="post" className="space-y-4">
          <input type="hidden" name="intent" value="password" />

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
              minLength={8}
              className="w-full px-3 py-2 bg-card-muted border border-stroke rounded focus:outline-none focus:border-accent"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold mb-1">
              Confirmar Senha
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              minLength={8}
              className="w-full px-3 py-2 bg-card-muted border border-stroke rounded focus:outline-none focus:border-accent"
              placeholder="••••••••"
            />
          </div>

          {(actionData?.error || googleError) && (
            <div className="bg-red-600 bg-opacity-10 border border-red-600 rounded p-3 text-sm text-red-600">
              {actionData?.error ?? googleError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 bg-accent text-card rounded hover:bg-accent-hover transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Criando conta..." : "Criar Conta"}
          </button>
        </Form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted">Já tem uma conta? </span>
          <Link to="/login" className="text-accent hover:underline font-semibold">
            Faça login
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
