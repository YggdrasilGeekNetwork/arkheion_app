import { GoogleLogin } from "@react-oauth/google"

interface Props {
  label?: string
  onToken: (idToken: string) => void
  onError?: () => void
}

/**
 * Client-side Google Sign-In button.
 * Uses the One-Tap / credential flow — onToken receives the ID token (credential).
 * Must be rendered inside a GoogleOAuthProvider.
 */
export function GoogleSignInButton({ label = "Entrar com Google", onToken, onError }: Props) {
  return (
    <GoogleLogin
      onSuccess={(credentialResponse) => {
        if (credentialResponse.credential) {
          onToken(credentialResponse.credential)
        }
      }}
      onError={onError}
      text={label === "Entrar com Google" ? "signin_with" : "signup_with"}
      shape="rectangular"
      theme="outline"
      size="large"
      width="100%"
    />
  )
}
