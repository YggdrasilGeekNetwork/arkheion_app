import { redirect, type LoaderFunctionArgs } from "@remix-run/node"
import { requireUserToken } from "~/utils/session.server"

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserToken(request)
  return redirect("/dm/mesas")
}
