// Catch-all route for 404s and unmatched paths
export function loader() {
  // Return empty response for Chrome DevTools and other unmatched requests
  return new Response(null, { status: 404 })
}

export default function CatchAll() {
  return null
}
