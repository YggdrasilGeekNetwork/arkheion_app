import type { MetaFunction, ActionFunctionArgs } from "@remix-run/node"
import { Form, Link, useActionData, useNavigation } from "@remix-run/react"
import { redirect, json } from "@remix-run/node"
import { signup } from "~/utils/api"

export const meta: MetaFunction = () => {
  return [
    { title: "Cadastro - Arkheion" },
    { name: "description", content: "Crie sua conta no Arkheion" },
  ]
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!name || !email || !password || !confirmPassword) {
    return json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
  }

  if (password !== confirmPassword) {
    return json({ error: "As senhas não coincidem" }, { status: 400 })
  }

  if (password.length < 6) {
    return json({ error: "A senha deve ter pelo menos 6 caracteres" }, { status: 400 })
  }

  // MOCKED: Skip API call and redirect to characters
  // const result = await signup(email, password, name)
  // if (result.error) {
  //   return json({ error: result.error }, { status: 400 })
  // }

  // TODO: Set session/cookie with token
  return redirect("/characters")
}

export default function Signup() {
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-accent mb-2">ARKHEION</h1>
        <p className="text-muted">Crie sua conta</p>
      </div>

      <div className="bg-card border border-stroke rounded-lg p-6">
        <Form method="post" className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold mb-1">
              Nome
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-3 py-2 bg-card-muted border border-stroke rounded focus:outline-none focus:border-accent"
              placeholder="Seu nome"
            />
          </div>

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
              minLength={6}
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
              minLength={6}
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
