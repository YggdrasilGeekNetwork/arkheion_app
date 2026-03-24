import { describe, it, expect } from "vitest"

// Pure logic extracted from forgot-password route for unit testing

function validateForgotPasswordForm(email: string | null): string | null {
  if (!email) return "Email é obrigatório"
  return null
}

describe("forgot-password route logic", () => {
  it("returns error when email is missing", () => {
    expect(validateForgotPasswordForm(null)).toBe("Email é obrigatório")
    expect(validateForgotPasswordForm("")).toBe("Email é obrigatório")
  })

  it("returns null when email is present", () => {
    expect(validateForgotPasswordForm("user@example.com")).toBeNull()
  })
})
