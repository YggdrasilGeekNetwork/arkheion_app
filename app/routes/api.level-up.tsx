import { json, type ActionFunctionArgs } from "@remix-run/node"
import { requireUserToken } from "~/utils/session.server"
import { gqlRequest } from "~/utils/graphql.server"
import { LEVEL_UP_CHARACTER_MUTATION } from "~/graphql/characters"

type LevelUpResult = {
  levelUpCharacter: {
    character: { id: string; version: number } | null
    errors: string[] | null
  }
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 })
  }

  const token = await requireUserToken(request)

  try {
    const body = await request.json() as {
      characterId: string
      classKey: string
      abilitiesChosen: string[]
    }

    const { characterId, classKey, abilitiesChosen } = body

    if (!characterId || !classKey) {
      return json({ error: "characterId and classKey are required" }, { status: 400 })
    }

    const result = await gqlRequest<LevelUpResult>(
      LEVEL_UP_CHARACTER_MUTATION,
      {
        id: characterId,
        input: {
          classKey,
          abilitiesChosen: { class_abilities: abilitiesChosen },
        },
      },
      token
    )

    if (result.errors) {
      return json({ error: result.errors[0]?.message }, { status: 422 })
    }

    const data = result.data?.levelUpCharacter
    if (data?.errors?.length) {
      return json({ error: data.errors[0] }, { status: 422 })
    }

    return json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao subir de nível"
    return json({ error: message }, { status: 500 })
  }
}
