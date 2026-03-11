import { json, type ActionFunctionArgs } from "@remix-run/node"
import { requireUserToken } from "~/utils/session.server"
import { gqlRequest } from "~/utils/graphql.server"
import { UPDATE_CHARACTER_CURRENCIES_MUTATION } from "~/graphql/characters"

type CurrenciesResult = {
  updateCharacterCurrencies: {
    character: { id: string; currencies: { tc: number; tp: number; to: number } } | null
    errors: string[] | null
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  if (request.method !== "PATCH") {
    return json({ error: "Method not allowed" }, { status: 405 })
  }

  const token = await requireUserToken(request)

  try {
    const body = await request.json() as { tc: number; tp: number; to: number }

    const result = await gqlRequest<CurrenciesResult>(
      UPDATE_CHARACTER_CURRENCIES_MUTATION,
      { id: params.characterId, currencies: body },
      token
    )

    if (result.errors) {
      return json({ error: result.errors[0]?.message }, { status: 422 })
    }

    return json({ ok: true })
  } catch (err) {
    return json({ error: "Erro ao atualizar moedas" }, { status: 500 })
  }
}
