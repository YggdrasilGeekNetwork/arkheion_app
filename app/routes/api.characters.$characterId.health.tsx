import { json, type ActionFunctionArgs } from "@remix-run/node"
import { requireUserToken } from "~/utils/session.server"
import { gqlRequest } from "~/utils/graphql.server"
import { UPDATE_CHARACTER_HEALTH_MUTATION } from "~/graphql/characters"

type HealthResult = {
  updateCharacterHealth: {
    character: { id: string; health: number } | null
    errors: string[] | null
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  if (request.method !== "PATCH") {
    return json({ error: "Method not allowed" }, { status: 405 })
  }

  const token = await requireUserToken(request)

  try {
    const body = await request.json() as { health: number }

    const result = await gqlRequest<HealthResult>(
      UPDATE_CHARACTER_HEALTH_MUTATION,
      { id: params.characterId, health: body.health },
      token
    )

    if (result.errors) {
      return json({ error: result.errors[0]?.message }, { status: 422 })
    }

    return json({ ok: true })
  } catch (err) {
    return json({ error: "Erro ao atualizar PV" }, { status: 500 })
  }
}
