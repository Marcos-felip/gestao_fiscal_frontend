export class AuthToken {
  readonly accessToken: string
  readonly refreshToken: string

  constructor(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken
    this.refreshToken = refreshToken
  }

  static fromJson(json: Record<string, unknown> | { accessToken: string; refreshToken: string }): AuthToken {
    const data = json as { accessToken: string; refreshToken: string }
    return new AuthToken(data.accessToken, data.refreshToken)
  }
}
