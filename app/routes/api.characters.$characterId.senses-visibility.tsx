import { json, type ActionFunctionArgs } from "@remix-run/node"
import { requireUserToken } from "~/utils/session.server"
import { gqlRequest } from "~/utils/graphql.server"
import { UPDATE_CHARACTER_HIDDEN_SENSES_MUTATION } from "~/graphql/characters"

type HiddenSensesResult = {
  updateCharacterHiddenSenses: {
    character: { id: string } | null
    errors: string[] | null
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  if (request.method !== "PATCH") {
    return json({ error: "Method not allowed" }, { status: 405 })
  }

  const token = await requireUserToken(request)

  try {
    const body = await request.json() as { hiddenSenseNames: string[] }

    const result = await gqlRequest<HiddenSensesResult>(
      UPDATE_CHARACTER_HIDDEN_SENSES_MUTATION,
      { id: params.characterId, hiddenSenseNames: body.hiddenSenseNames },
      token
    )

    if (result.errors) {
      return json({ error: result.errors[0]?.message }, { status: 422 })
    }

    return json({ ok: true })
  } catch (err) {
    return json({ error: "Erro ao atualizar visibilidade dos sentidos" }, { status: 500 })
  }
}
