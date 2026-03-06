import type { ActionFunctionArgs } from "@remix-run/node"
import { destroySession } from "~/utils/session.server"

export async function action({ request }: ActionFunctionArgs) {
  return destroySession(request)
}
