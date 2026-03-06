import { createCookieSessionStorage, redirect } from "@remix-run/node"

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET ?? "dev-secret"],
    maxAge: 60 * 60 * 24 * 7, // 7 days — matches refresh token expiry
  },
})

export async function getSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"))
}

export async function createUserSession({
  request,
  accessToken,
  refreshToken,
  redirectTo,
}: {
  request: Request
  accessToken: string
  refreshToken: string
  redirectTo: string
}) {
  const session = await getSession(request)
  session.set("accessToken", accessToken)
  session.set("refreshToken", refreshToken)
  return redirect(redirectTo, {
    headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
  })
}

export async function getUserToken(request: Request): Promise<string | null> {
  const session = await getSession(request)
  return session.get("accessToken") ?? null
}

/** Retorna o access token ou redireciona para /login se não autenticado. */
export async function requireUserToken(request: Request): Promise<string> {
  const token = await getUserToken(request)
  if (!token) throw redirect("/login")
  return token
}

export async function destroySession(request: Request) {
  const session = await getSession(request)
  return redirect("/login", {
    headers: { "Set-Cookie": await sessionStorage.destroySession(session) },
  })
}
