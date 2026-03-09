import { json, type LoaderFunctionArgs } from "@remix-run/node"
import { requireUserToken } from "~/utils/session.server"
import { gqlRequest } from "~/utils/graphql.server"
import { GET_CLASS_POWERS_FOR_LEVEL_QUERY } from "~/graphql/characters"

type ClassPowersResponse = {
  classPowersForLevel: {
    powerChoices: number
    fixedAbilities: string[]
    selectablePowers: {
      id: string
      name: string
      description: string
      type: string
      cost?: { pm?: number; pv?: number } | null
      source?: string | null
    }[]
  } | null
}

export async function loader({ request }: LoaderFunctionArgs) {
  const token = await requireUserToken(request)
  const url = new URL(request.url)
  const classKey = url.searchParams.get("classKey")
  const level = url.searchParams.get("level")
  const characterId = url.searchParams.get("characterId")

  if (!classKey || !level) {
    return json({ error: "classKey and level are required" }, { status: 400 })
  }

  try {
    const result = await gqlRequest<ClassPowersResponse>(
      GET_CLASS_POWERS_FOR_LEVEL_QUERY,
      { classKey, level: parseInt(level, 10), characterId },
      token
    )
    return json(result.data?.classPowersForLevel ?? null)
  } catch {
    return json(null, { status: 500 })
  }
}
