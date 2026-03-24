import { describe, it, expect } from "vitest"

// Pure validation logic extracted from profile route

function validateSetPassword(password: string, passwordConfirmation: string): string | null {
  if (password !== passwordConfirmation) return "As senhas não coincidem"
  if (password.length < 8) return "A senha deve ter pelo menos 8 caracteres"
  return null
}

function validateChangePassword(newPassword: string, newPasswordConfirmation: string): string | null {
  if (newPassword !== newPasswordConfirmation) return "As senhas não coincidem"
  if (newPassword.length < 8) return "A nova senha deve ter pelo menos 8 caracteres"
  return null
}

describe("profile route logic", () => {
  describe("set_password validation", () => {
    it("returns error when passwords do not match", () => {
      expect(validateSetPassword("pass1234", "different")).toBe("As senhas não coincidem")
    })

    it("returns error when password is too short", () => {
      expect(validateSetPassword("short", "short")).toBe("A senha deve ter pelo menos 8 caracteres")
    })

    it("returns null for valid input", () => {
      expect(validateSetPassword("longpassword", "longpassword")).toBeNull()
    })
  })

  describe("change_password validation", () => {
    it("returns error when passwords do not match", () => {
      expect(validateChangePassword("pass1234", "different")).toBe("As senhas não coincidem")
    })

    it("returns error when password is too short", () => {
      expect(validateChangePassword("short", "short")).toBe("A nova senha deve ter pelo menos 8 caracteres")
    })

    it("returns null for valid input", () => {
      expect(validateChangePassword("newpassword1", "newpassword1")).toBeNull()
    })
  })
})
