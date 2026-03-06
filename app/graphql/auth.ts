export const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      user { id email username displayName }
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
      user { id email username displayName }
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
    me { id email username displayName }
  }
`
