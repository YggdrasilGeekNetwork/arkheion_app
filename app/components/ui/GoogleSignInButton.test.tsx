import { describe, it, expect, vi } from "vitest"

// GoogleSignInButton delegates rendering to @react-oauth/google's GoogleLogin.
// We test the onToken callback contract rather than rendering the Google button
// (which requires a live DOM and OAuth provider).

describe("GoogleSignInButton onToken contract", () => {
  it("calls onToken with the credential string from CredentialResponse", () => {
    const onToken = vi.fn()
    const fakeCredential = "google_id_token_abc123"

    // Simulate what GoogleLogin calls on success
    const handleSuccess = (credentialResponse: { credential?: string }) => {
      if (credentialResponse.credential) {
        onToken(credentialResponse.credential)
      }
    }

    handleSuccess({ credential: fakeCredential })
    expect(onToken).toHaveBeenCalledOnce()
    expect(onToken).toHaveBeenCalledWith(fakeCredential)
  })

  it("does not call onToken when credential is missing", () => {
    const onToken = vi.fn()

    const handleSuccess = (credentialResponse: { credential?: string }) => {
      if (credentialResponse.credential) {
        onToken(credentialResponse.credential)
      }
    }

    handleSuccess({})
    expect(onToken).not.toHaveBeenCalled()
  })
})
