import { describe, it, expect } from "vitest"
import {
  LOGIN_MUTATION,
  REGISTER_MUTATION,
  LOGOUT_MUTATION,
  ME_QUERY,
  FORGOT_PASSWORD_MUTATION,
  RESET_PASSWORD_MUTATION,
  CONFIRM_EMAIL_MUTATION,
  RESEND_CONFIRMATION_MUTATION,
  OAUTH_GOOGLE_MUTATION,
  SET_PASSWORD_MUTATION,
  UPDATE_PROFILE_MUTATION,
  CHANGE_PASSWORD_MUTATION,
} from "./auth"

describe("auth GraphQL queries/mutations", () => {
  it("LOGIN_MUTATION includes required fields", () => {
    expect(LOGIN_MUTATION).toContain("mutation Login")
    expect(LOGIN_MUTATION).toContain("$email: String!")
    expect(LOGIN_MUTATION).toContain("$password: String!")
    expect(LOGIN_MUTATION).toContain("accessToken")
    expect(LOGIN_MUTATION).toContain("refreshToken")
    expect(LOGIN_MUTATION).toContain("hasPassword")
    expect(LOGIN_MUTATION).toContain("oauthProviders")
    expect(LOGIN_MUTATION).toContain("avatarUrl")
  })

  it("REGISTER_MUTATION includes required fields", () => {
    expect(REGISTER_MUTATION).toContain("mutation Register")
    expect(REGISTER_MUTATION).toContain("$passwordConfirmation: String!")
    expect(REGISTER_MUTATION).toContain("accessToken")
  })

  it("LOGOUT_MUTATION is defined", () => {
    expect(LOGOUT_MUTATION).toContain("mutation Logout")
    expect(LOGOUT_MUTATION).toContain("success")
  })

  it("ME_QUERY includes new user fields", () => {
    expect(ME_QUERY).toContain("query Me")
    expect(ME_QUERY).toContain("hasPassword")
    expect(ME_QUERY).toContain("oauthProviders")
    expect(ME_QUERY).toContain("avatarUrl")
  })

  it("FORGOT_PASSWORD_MUTATION is defined correctly", () => {
    expect(FORGOT_PASSWORD_MUTATION).toContain("mutation ForgotPassword")
    expect(FORGOT_PASSWORD_MUTATION).toContain("$email: String!")
    expect(FORGOT_PASSWORD_MUTATION).toContain("success")
  })

  it("RESET_PASSWORD_MUTATION includes token and password fields", () => {
    expect(RESET_PASSWORD_MUTATION).toContain("mutation ResetPassword")
    expect(RESET_PASSWORD_MUTATION).toContain("$token: String!")
    expect(RESET_PASSWORD_MUTATION).toContain("$password: String!")
    expect(RESET_PASSWORD_MUTATION).toContain("$passwordConfirmation: String!")
    expect(RESET_PASSWORD_MUTATION).toContain("accessToken")
  })

  it("CONFIRM_EMAIL_MUTATION includes token", () => {
    expect(CONFIRM_EMAIL_MUTATION).toContain("mutation ConfirmEmail")
    expect(CONFIRM_EMAIL_MUTATION).toContain("$token: String!")
    expect(CONFIRM_EMAIL_MUTATION).toContain("accessToken")
  })

  it("RESEND_CONFIRMATION_MUTATION is defined", () => {
    expect(RESEND_CONFIRMATION_MUTATION).toContain("mutation ResendConfirmation")
    expect(RESEND_CONFIRMATION_MUTATION).toContain("$email: String!")
    expect(RESEND_CONFIRMATION_MUTATION).toContain("success")
  })

  it("OAUTH_GOOGLE_MUTATION includes idToken", () => {
    expect(OAUTH_GOOGLE_MUTATION).toContain("mutation OauthGoogle")
    expect(OAUTH_GOOGLE_MUTATION).toContain("$idToken: String!")
    expect(OAUTH_GOOGLE_MUTATION).toContain("accessToken")
  })

  it("SET_PASSWORD_MUTATION includes password fields", () => {
    expect(SET_PASSWORD_MUTATION).toContain("mutation SetPassword")
    expect(SET_PASSWORD_MUTATION).toContain("$password: String!")
    expect(SET_PASSWORD_MUTATION).toContain("$passwordConfirmation: String!")
  })

  it("UPDATE_PROFILE_MUTATION has optional fields", () => {
    expect(UPDATE_PROFILE_MUTATION).toContain("mutation UpdateProfile")
    expect(UPDATE_PROFILE_MUTATION).toContain("$username: String")
    expect(UPDATE_PROFILE_MUTATION).toContain("$displayName: String")
  })

  it("CHANGE_PASSWORD_MUTATION includes current and new password", () => {
    expect(CHANGE_PASSWORD_MUTATION).toContain("mutation ChangePassword")
    expect(CHANGE_PASSWORD_MUTATION).toContain("$currentPassword: String!")
    expect(CHANGE_PASSWORD_MUTATION).toContain("$newPassword: String!")
  })
})
