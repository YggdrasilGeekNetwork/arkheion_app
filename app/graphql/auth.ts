export const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      user { id email username displayName avatarUrl hasPassword oauthProviders }
      accessToken
      refreshToken
      errors
    }
  }
`

export const REGISTER_MUTATION = `
  mutation Register(
    $email: String!
    $username: String!
    $password: String!
    $passwordConfirmation: String!
  ) {
    register(
      email: $email
      username: $username
      password: $password
      passwordConfirmation: $passwordConfirmation
    ) {
      user { id email username displayName avatarUrl hasPassword oauthProviders }
      accessToken
      refreshToken
      errors
    }
  }
`

export const LOGOUT_MUTATION = `
  mutation Logout {
    logout { success errors }
  }
`

export const ME_QUERY = `
  query Me {
    me { id email username displayName avatarUrl hasPassword oauthProviders }
  }
`

export const FORGOT_PASSWORD_MUTATION = `
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email) {
      success
      errors
    }
  }
`

export const RESET_PASSWORD_MUTATION = `
  mutation ResetPassword(
    $token: String!
    $password: String!
    $passwordConfirmation: String!
  ) {
    resetPassword(
      token: $token
      password: $password
      passwordConfirmation: $passwordConfirmation
    ) {
      user { id email username displayName avatarUrl hasPassword oauthProviders }
      accessToken
      refreshToken
      errors
    }
  }
`

export const CONFIRM_EMAIL_MUTATION = `
  mutation ConfirmEmail($token: String!) {
    confirmEmail(token: $token) {
      user { id email username displayName avatarUrl hasPassword oauthProviders }
      accessToken
      refreshToken
      errors
    }
  }
`

export const RESEND_CONFIRMATION_MUTATION = `
  mutation ResendConfirmation($email: String!) {
    resendConfirmation(email: $email) {
      success
      errors
    }
  }
`

export const OAUTH_GOOGLE_MUTATION = `
  mutation OauthGoogle($idToken: String!) {
    oauthGoogle(idToken: $idToken) {
      user { id email username displayName avatarUrl hasPassword oauthProviders }
      accessToken
      refreshToken
      errors
    }
  }
`

export const SET_PASSWORD_MUTATION = `
  mutation SetPassword($password: String!, $passwordConfirmation: String!) {
    setPassword(password: $password, passwordConfirmation: $passwordConfirmation) {
      user { id email username displayName avatarUrl hasPassword oauthProviders }
      accessToken
      refreshToken
      errors
    }
  }
`

export const CHANGE_PASSWORD_MUTATION = `
  mutation ChangePassword(
    $currentPassword: String!
    $newPassword: String!
    $newPasswordConfirmation: String!
  ) {
    changePassword(
      currentPassword: $currentPassword
      newPassword: $newPassword
      newPasswordConfirmation: $newPasswordConfirmation
    ) {
      user { id email username displayName avatarUrl hasPassword oauthProviders }
      accessToken
      refreshToken
      errors
    }
  }
`

export const UPDATE_PROFILE_MUTATION = `
  mutation UpdateProfile($username: String, $displayName: String) {
    updateProfile(username: $username, displayName: $displayName) {
      user { id email username displayName avatarUrl hasPassword oauthProviders }
      errors
    }
  }
`
