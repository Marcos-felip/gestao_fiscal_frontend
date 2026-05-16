export class AuthToken {
  readonly accessToken: string
  readonly refreshToken: string

  constructor(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken
    this.refreshToken = refreshToken
  }

  static fromJson(json: Record<string, unknown>): AuthToken {
    return new AuthToken(
      json.accessToken as string,
      json.refreshToken as string,
    )
  }
}