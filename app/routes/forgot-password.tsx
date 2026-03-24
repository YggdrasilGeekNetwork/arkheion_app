import type { MetaFunction, ActionFunctionArgs } from "@remix-run/node"
import { Form, Link, useActionData, useNavigation } from "@remix-run/react"
import { json } from "@remix-run/node"
import { gqlRequest } from "~/utils/graphql.server"
import { FORGOT_PASSWORD_MUTATION } from "~/graphql/auth"

export const meta: MetaFunction = () => [
  { title: "Esqueceu a senha - Arkheion" },
]

interface ForgotPayload {
  forgotPassword: { success: boolean; errors: string[] | null }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const email = formData.get("email") as string

  if (!email) {
    return json({ error: "Email é obrigatório", success: false })
  }

  try {
    await gqlRequest<ForgotPayload>(FORGOT_PASSWORD_MUTATION, { email })
  } catch {
    // Silently succeed even on API error — don't leak info
  }

  return json({ success: true, error: null })
}

export default function ForgotPassword() {
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-accent mb-2">ARKHEION</h1>
        <p className="text-muted">Recuperar senha</p>
      </div>

      <div className="bg-card border border-stroke rounded-lg p-6">
        {actionData?.success ? (
          <div className="text-center space-y-4">
            <p className="text-text">
              Se o email informado estiver cadastrado, você receberá um link para redefinir sua senha em breve.
            </p>
            <Link to="/login" className="text-accent hover:underline font-semibold text-sm">
              Voltar para o login
            </Link>
          </div>
        ) : (
          <Form method="post" className="space-y-4">
            <p className="text-muted text-sm mb-4">
              Informe seu email e enviaremos um link para redefinir sua senha.
            </p>

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
              {isSubmitting ? "Enviando..." : "Enviar link"}
            </button>

            <div className="text-center">
              <Link to="/login" className="text-muted hover:text-text text-sm">
                ← Voltar para o login
              </Link>
            </div>
          </Form>
        )}
      </div>
    </div>
  )
}
