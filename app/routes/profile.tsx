import type { MetaFunction, ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react"
import AppHeader from "~/components/ui/AppHeader"
import { json } from "@remix-run/node"
import { gqlRequest } from "~/utils/graphql.server"
import { requireUserToken } from "~/utils/session.server"
import {
  ME_QUERY,
  UPDATE_PROFILE_MUTATION,
  SET_PASSWORD_MUTATION,
  CHANGE_PASSWORD_MUTATION,
} from "~/graphql/auth"

export const meta: MetaFunction = () => [{ title: "Perfil - Arkheion" }]

interface MeUser {
  id: string
  email: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  hasPassword: boolean
  oauthProviders: string[]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const token = await requireUserToken(request)
  let result: Awaited<ReturnType<typeof gqlRequest<{ me: MeUser }>>>
  try {
    result = await gqlRequest<{ me: MeUser }>(ME_QUERY, {}, token)
  } catch {
    return json({ user: null, error: "Não foi possível carregar o perfil." })
  }
  return json({ user: result.data?.me ?? null, error: null })
}

export async function action({ request }: ActionFunctionArgs) {
  const token = await requireUserToken(request)
  const formData = await request.formData()
  const intent = formData.get("intent") as string

  if (intent === "update_profile") {
    const username = (formData.get("username") as string) || undefined
    const displayName = (formData.get("displayName") as string) ?? undefined

    let result: Awaited<ReturnType<typeof gqlRequest<{ updateProfile: { user: MeUser | null; errors: string[] | null } }>>>
    try {
      result = await gqlRequest(UPDATE_PROFILE_MUTATION, { username, displayName }, token)
    } catch {
      return json({ error: "Serviço indisponível.", success: false })
    }
    const payload = result.data?.updateProfile
    if (payload?.errors?.length) {
      return json({ error: payload.errors.join("; "), success: false })
    }
    return json({ success: true, error: null })
  }

  if (intent === "set_password") {
    const password = formData.get("password") as string
    const passwordConfirmation = formData.get("passwordConfirmation") as string

    if (password !== passwordConfirmation) {
      return json({ error: "As senhas não coincidem", success: false })
    }
    if (password.length < 8) {
      return json({ error: "A senha deve ter pelo menos 8 caracteres", success: false })
    }

    let result: Awaited<ReturnType<typeof gqlRequest<{ setPassword: { errors: string[] | null } }>>>
    try {
      result = await gqlRequest(SET_PASSWORD_MUTATION, { password, passwordConfirmation }, token)
    } catch {
      return json({ error: "Serviço indisponível.", success: false })
    }
    const payload = result.data?.setPassword
    if (payload?.errors?.length) {
      return json({ error: payload.errors.join("; "), success: false })
    }
    return json({ success: true, error: null, message: "Senha definida com sucesso." })
  }

  if (intent === "change_password") {
    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string
    const newPasswordConfirmation = formData.get("newPasswordConfirmation") as string

    if (newPassword !== newPasswordConfirmation) {
      return json({ error: "As senhas não coincidem", success: false })
    }
    if (newPassword.length < 8) {
      return json({ error: "A nova senha deve ter pelo menos 8 caracteres", success: false })
    }

    let result: Awaited<ReturnType<typeof gqlRequest<{ changePassword: { errors: string[] | null } }>>>
    try {
      result = await gqlRequest(CHANGE_PASSWORD_MUTATION, { currentPassword, newPassword, newPasswordConfirmation }, token)
    } catch {
      return json({ error: "Serviço indisponível.", success: false })
    }
    const payload = result.data?.changePassword
    if (payload?.errors?.length) {
      return json({ error: payload.errors.join("; "), success: false })
    }
    return json({ success: true, error: null, message: "Senha alterada com sucesso." })
  }

  return json({ error: "Ação desconhecida", success: false })
}

export default function Profile() {
  const { user, error: loadError } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"

  if (loadError || !user) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-muted">{loadError ?? "Erro ao carregar perfil."}</p>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col">
      <AppHeader />
    <div className="w-full max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-accent">Meu Perfil</h1>

      {/* Avatar + email */}
      <div className="bg-card border border-stroke rounded-lg p-6 flex items-center gap-4">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-card-muted flex items-center justify-center text-2xl font-bold text-accent">
            {user.username[0].toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-semibold">{user.displayName ?? user.username}</p>
          <p className="text-muted text-sm">{user.email}</p>
          {user.oauthProviders.length > 0 && (
            <p className="text-muted text-xs mt-1">
              Conectado via: {user.oauthProviders.join(", ")}
            </p>
          )}
        </div>
      </div>

      {/* Update profile */}
      <div className="bg-card border border-stroke rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Informações do perfil</h2>
        <Form method="post" className="space-y-4">
          <input type="hidden" name="intent" value="update_profile" />

          <div>
            <label htmlFor="username" className="block text-sm font-semibold mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              defaultValue={user.username}
              minLength={3}
              maxLength={30}
              className="w-full px-3 py-2 bg-card-muted border border-stroke rounded focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label htmlFor="displayName" className="block text-sm font-semibold mb-1">
              Nome de exibição
            </label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              defaultValue={user.displayName ?? ""}
              className="w-full px-3 py-2 bg-card-muted border border-stroke rounded focus:outline-none focus:border-accent"
            />
          </div>

          {actionData && (
            <div className={`rounded p-3 text-sm ${actionData.success ? "bg-green-600 bg-opacity-10 border border-green-600 text-green-600" : "bg-red-600 bg-opacity-10 border border-red-600 text-red-600"}`}>
              {"message" in actionData && actionData.message ? actionData.message : actionData.success ? "Salvo!" : actionData.error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="py-2 px-4 bg-accent text-card rounded hover:bg-accent-hover transition-colors font-semibold disabled:opacity-50"
          >
            {isSubmitting ? "Salvando..." : "Salvar"}
          </button>
        </Form>
      </div>

      {/* Change password — only if user has one */}
      {user.hasPassword && (
        <div className="bg-card border border-stroke rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Alterar senha</h2>
          <Form method="post" className="space-y-4">
            <input type="hidden" name="intent" value="change_password" />

            <div>
              <label htmlFor="currentPassword" className="block text-sm font-semibold mb-1">
                Senha atual
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                required
                className="w-full px-3 py-2 bg-card-muted border border-stroke rounded focus:outline-none focus:border-accent"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-semibold mb-1">
                Nova senha
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                required
                minLength={8}
                className="w-full px-3 py-2 bg-card-muted border border-stroke rounded focus:outline-none focus:border-accent"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="newPasswordConfirmation" className="block text-sm font-semibold mb-1">
                Confirmar nova senha
              </label>
              <input
                type="password"
                id="newPasswordConfirmation"
                name="newPasswordConfirmation"
                required
                minLength={8}
                className="w-full px-3 py-2 bg-card-muted border border-stroke rounded focus:outline-none focus:border-accent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2 px-4 bg-accent text-card rounded hover:bg-accent-hover transition-colors font-semibold disabled:opacity-50"
            >
              {isSubmitting ? "Alterando..." : "Alterar senha"}
            </button>
          </Form>
        </div>
      )}

      {/* Set password — only for OAuth-only users */}
      {!user.hasPassword && (
        <div className="bg-card border border-stroke rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Definir senha</h2>
          <p className="text-muted text-sm mb-4">
            Você ainda não tem uma senha. Defina uma para poder entrar com email e senha também.
          </p>
          <Form method="post" className="space-y-4">
            <input type="hidden" name="intent" value="set_password" />

            <div>
              <label htmlFor="setPassword" className="block text-sm font-semibold mb-1">
                Nova senha
              </label>
              <input
                type="password"
                id="setPassword"
                name="password"
                required
                minLength={8}
                className="w-full px-3 py-2 bg-card-muted border border-stroke rounded focus:outline-none focus:border-accent"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="setPasswordConfirmation" className="block text-sm font-semibold mb-1">
                Confirmar senha
              </label>
              <input
                type="password"
                id="setPasswordConfirmation"
                name="passwordConfirmation"
                required
                minLength={8}
                className="w-full px-3 py-2 bg-card-muted border border-stroke rounded focus:outline-none focus:border-accent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2 px-4 bg-accent text-card rounded hover:bg-accent-hover transition-colors font-semibold disabled:opacity-50"
            >
              {isSubmitting ? "Definindo..." : "Definir senha"}
            </button>
          </Form>
        </div>
      )}
    </div>
    </div>
  )
}
