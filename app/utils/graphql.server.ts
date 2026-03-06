import { destroySession } from "~/utils/session.server"

const GQL_URL = process.env.GRAPHQL_API_URL ?? "http://localhost:3000/graphql"

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized")
    this.name = "UnauthorizedError"
  }
}

export async function gqlRequest<T>(
  query: string,
  variables: Record<string, unknown> = {},
  accessToken?: string,
): Promise<{ data?: T; errors?: Array<{ message: string }> }> {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`

  const res = await fetch(GQL_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  })

  if (res.status === 401) throw new UnauthorizedError()

  if (!res.ok) {
    throw new Error(`GraphQL request failed: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

/**
 * Wraps gqlRequest and automatically destroys the session on 401,
 * redirecting the user to /login.
 */
export async function gqlRequestOrLogout<T>(
  request: Request,
  query: string,
  variables: Record<string, unknown>,
  token: string,
): Promise<{ data?: T; errors?: Array<{ message: string }> }> {
  try {
    return await gqlRequest<T>(query, variables, token)
  } catch (e) {
    if (e instanceof UnauthorizedError) {
      throw await destroySession(request)
    }
    throw e
  }
}
