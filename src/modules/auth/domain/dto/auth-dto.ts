export class LoginDto {
  email: string
  password: string

  constructor(email: string, password: string) {
    this.email = email
    this.password = password
  }
}

export class RegisterDto {
  name: string
  email: string
  password: string

  constructor(name: string, email: string, password: string) {
    this.name = name
    this.email = email
    this.password = password
  }
}

export class RefreshTokenDto {
  refreshToken: string

  constructor(refreshToken: string) {
    this.refreshToken = refreshToken
  }
}

export class AuthUserResponseDto {
  id: string
  name: string
  email: string
  companyActiveId: string | null
  role: string | null
  forcePasswordChange: boolean

  constructor(
    id: string,
    name: string,
    email: string,
    companyActiveId: string | null,
    role: string | null,
    forcePasswordChange: boolean,
  ) {
    this.id = id
    this.name = name
    this.email = email
    this.companyActiveId = companyActiveId
    this.role = role
    this.forcePasswordChange = forcePasswordChange
  }
}

export class AuthResponseDto {
  accessToken: string
  refreshToken: string
  user: AuthUserResponseDto

  constructor(
    accessToken: string,
    refreshToken: string,
    user: AuthUserResponseDto,
  ) {
    this.accessToken = accessToken
    this.refreshToken = refreshToken
    this.user = user
  }
}
