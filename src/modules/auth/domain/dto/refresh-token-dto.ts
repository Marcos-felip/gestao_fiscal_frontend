export class RefreshTokenDto {
  refreshToken: string

  constructor(refreshToken: string) {
    this.refreshToken = refreshToken
  }
}
