import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/lib/integration/react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { store, persistor } from '~/store'
import { getUserToken } from '~/utils/session.server'
import { gqlRequest } from '~/utils/graphql.server'
import { ME_QUERY } from '~/graphql/auth'

type MeResult = { me: { id: string; username: string; displayName: string | null; avatarUrl: string | null } | null }

export async function loader({ request }: LoaderFunctionArgs) {
  const token = await getUserToken(request)
  let currentUser: MeResult['me'] = null
  if (token) {
    try {
      const result = await gqlRequest<MeResult>(ME_QUERY, {}, token)
      currentUser = result.data?.me ?? null
    } catch {
      // not logged in or token expired — ignore
    }
  }
  return json({
    googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
    currentUser,
  })
}

import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-bg flex justify-center h-[100dvh]">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { googleClientId } = useLoaderData<typeof loader>()
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Outlet />
        </PersistGate>
      </Provider>
    </GoogleOAuthProvider>
  );
}
