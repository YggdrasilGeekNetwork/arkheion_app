import { describe, it, expect } from "vitest"

// Pure validation logic extracted from reset-password route

function validateResetPasswordForm(
  token: string,
  password: string,
  passwordConfirmation: string
): string | null {
  if (!token) return "Token inválido ou ausente"
  if (!password || !passwordConfirmation) return "Todos os campos são obrigatórios"
  if (password !== passwordConfirmation) return "As senhas não coincidem"
  if (password.length < 8) return "A senha deve ter pelo menos 8 caracteres"
  return null
}

describe("reset-password route logic", () => {
  it("returns error when token is missing", () => {
    expect(validateResetPasswordForm("", "newpass123", "newpass123")).toBe("Token inválido ou ausente")
  })

  it("returns error when fields are empty", () => {
    expect(validateResetPasswordForm("tok", "", "")).toBe("Todos os campos são obrigatórios")
  })

  it("returns error when passwords do not match", () => {
    expect(validateResetPasswordForm("tok", "pass1234", "different")).toBe("As senhas não coincidem")
  })

  it("returns error when password is too short", () => {
    expect(validateResetPasswordForm("tok", "short", "short")).toBe("A senha deve ter pelo menos 8 caracteres")
  })

  it("returns null for valid input", () => {
    expect(validateResetPasswordForm("tok", "longpassword", "longpassword")).toBeNull()
  })
})
