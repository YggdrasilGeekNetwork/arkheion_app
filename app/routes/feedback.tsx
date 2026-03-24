import { useState } from "react"
import type { MetaFunction, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData, useFetcher } from "@remix-run/react"
import { requireUserToken } from "~/utils/session.server"
import { gqlRequestOrLogout, gqlRequest } from "~/utils/graphql.server"
import {
  GET_FEEDBACK_ITEMS_QUERY,
  SUBMIT_FEEDBACK_MUTATION,
  TOGGLE_UPVOTE_MUTATION,
} from "~/graphql/feedback"
import AppHeader from "~/components/ui/AppHeader"

export const meta: MetaFunction = () => [
  { title: "Feedback - Arkheion" },
  { name: "description", content: "Envie sugestões e reporte problemas" },
]

type FeedbackItem = {
  id: string
  title: string
  description: string | null
  status: string
  progress: number
  upvotesCount: number
  upvoted: boolean
  createdAt: string
}

const STATUS_LABEL: Record<string, string> = {
  approved: "Aprovado",
  in_progress: "Em andamento",
  done: "Concluído",
}

const STATUS_COLOR: Record<string, string> = {
  approved: "text-blue-400 border-blue-400",
  in_progress: "text-yellow-400 border-yellow-400",
  done: "text-green-400 border-green-400",
}

export async function loader({ request }: LoaderFunctionArgs) {
  const token = await requireUserToken(request)

  const result = await gqlRequestOrLogout<{ feedbackItems: FeedbackItem[] }>(
    request,
    GET_FEEDBACK_ITEMS_QUERY,
    {},
    token,
  )

  return json({ items: result.data?.feedbackItems ?? [] })
}

export async function action({ request }: ActionFunctionArgs) {
  const token = await requireUserToken(request)
  const form = await request.formData()
  const intent = form.get("intent") as string

  try {
    if (intent === "submit") {
      const title = form.get("title") as string
      const description = form.get("description") as string | null

      const result = await gqlRequest<{
        submitFeedback: { feedbackItem: FeedbackItem | null; errors: string[] }
      }>(SUBMIT_FEEDBACK_MUTATION, { title, description: description || null }, token)

      const errors = result.data?.submitFeedback?.errors ?? []
      if (errors.length > 0) return json({ error: errors.join(", ") }, { status: 422 })

      return json({ ok: true })
    }

    if (intent === "upvote") {
      const feedbackItemId = form.get("feedbackItemId") as string
      await gqlRequest(TOGGLE_UPVOTE_MUTATION, { feedbackItemId }, token)
      return json({ ok: true })
    }

    return json({ error: "Ação inválida" }, { status: 400 })
  } catch {
    return json({ error: "Serviço indisponível" }, { status: 503 })
  }
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-muted mb-1">
        <span>Progresso</span>
        <span>{progress}%</span>
      </div>
      <div className="h-1.5 bg-stroke rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

function FeedbackCard({ item }: { item: FeedbackItem }) {
  const fetcher = useFetcher()
  const isDone = item.status === "done"
  const optimisticUpvoted =
    fetcher.state !== "idle" ? !item.upvoted : item.upvoted
  const optimisticCount =
    fetcher.state !== "idle"
      ? item.upvotesCount + (item.upvoted ? -1 : 1)
      : item.upvotesCount

  const upvoteButton = isDone ? (
    <div className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded border border-stroke text-muted opacity-40 flex-shrink-0 cursor-not-allowed">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" />
      </svg>
      <span className="text-xs font-medium">{item.upvotesCount}</span>
    </div>
  ) : (
    <fetcher.Form method="post" className="flex-shrink-0">
      <input type="hidden" name="intent" value="upvote" />
      <input type="hidden" name="feedbackItemId" value={item.id} />
      <button
        type="submit"
        className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded border transition-colors ${
          optimisticUpvoted
            ? "border-accent text-accent bg-accent/10"
            : "border-stroke text-muted hover:border-accent hover:text-accent"
        }`}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" />
        </svg>
        <span className="text-xs font-medium">{optimisticCount}</span>
      </button>
    </fetcher.Form>
  )

  return (
    <div className="bg-card border border-stroke rounded-lg p-4">
      <div className="flex items-start gap-3">
        {upvoteButton}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-sm">{item.title}</h3>
            <span
              className={`text-xs border rounded px-1.5 py-0.5 ${STATUS_COLOR[item.status] ?? "text-muted border-stroke"}`}
            >
              {STATUS_LABEL[item.status] ?? item.status}
            </span>
          </div>

          {item.description && (
            <p className="text-sm text-muted">{item.description}</p>
          )}

          {item.status === "in_progress" && item.progress > 0 && (
            <ProgressBar progress={item.progress} />
          )}
        </div>
      </div>
    </div>
  )
}

function SubmitForm() {
  const fetcher = useFetcher<typeof action>()
  const isSubmitting = fetcher.state !== "idle"
  const error = fetcher.data && "error" in fetcher.data ? fetcher.data.error : null
  const success = fetcher.data && "ok" in fetcher.data

  return (
    <fetcher.Form method="post" className="bg-card border border-stroke rounded-lg p-4">
      <input type="hidden" name="intent" value="submit" />
      <h2 className="font-semibold mb-3">Enviar sugestão ou relatar problema</h2>

      {success && (
        <p className="text-green-400 text-sm mb-3">
          Enviado! Nossa equipe vai analisar em breve.
        </p>
      )}
      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

      <div className="space-y-3">
        <input
          type="text"
          name="title"
          placeholder="Título"
          required
          maxLength={120}
          className="w-full bg-background border border-stroke rounded px-3 py-2 text-sm focus:border-accent focus:outline-none"
        />
        <textarea
          name="description"
          placeholder="Descrição (opcional)"
          rows={3}
          className="w-full bg-background border border-stroke rounded px-3 py-2 text-sm focus:border-accent focus:outline-none resize-none"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-accent text-background font-semibold text-sm px-4 py-2 rounded hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </fetcher.Form>
  )
}

export default function Feedback() {
  const { items } = useLoaderData<typeof loader>()
  const [doneOpen, setDoneOpen] = useState(false)

  const activeItems = items.filter((i) => i.status !== "done")
  const doneItems = items.filter((i) => i.status === "done")

  return (
    <div className="w-full flex flex-col">
      <AppHeader />
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Feedback</h1>
        <p className="text-muted text-sm mt-1">
          Vote nas sugestões aprovadas ou envie novos problemas e ideias.
        </p>
      </div>

      <div className="space-y-4">
        <SubmitForm />

        {activeItems.length === 0 && doneItems.length === 0 ? (
          <p className="text-center text-muted py-8">
            Nenhuma sugestão aprovada ainda.
          </p>
        ) : (
          <>
            {activeItems.length > 0 && (
              <div className="space-y-2">
                <h2 className="font-semibold text-sm text-muted uppercase tracking-wide">
                  Sugestões ({activeItems.length})
                </h2>
                {activeItems.map((item) => (
                  <FeedbackCard key={item.id} item={item} />
                ))}
              </div>
            )}

            {doneItems.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setDoneOpen((o) => !o)}
                  className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors w-full"
                >
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${doneOpen ? "rotate-90" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="font-semibold uppercase tracking-wide">
                    Concluídos ({doneItems.length})
                  </span>
                </button>

                {doneOpen && (
                  <div className="space-y-2 mt-2">
                    {doneItems.map((item) => (
                      <FeedbackCard key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </div>
  )
}
