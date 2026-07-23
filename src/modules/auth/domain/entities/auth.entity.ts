import { AuthUserResponseDto } from '@/modules/auth/domain/dto/auth-dto'

export class AuthUser {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly companyActiveId: string | null
  readonly role: string | null
  readonly forcePasswordChange: boolean

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

  static fromJson(json: Record<string, unknown> | AuthUserResponseDto): AuthUser {
    const data = json as AuthUserResponseDto
    return new AuthUser(
      data.id as string,
      data.name as string,
      data.email as string,
      data.companyActiveId as string | null,
      data.role as string | null,
      data.forcePasswordChange as boolean,
    )
  }

  get hasActiveCompany(): boolean {
    return this.companyActiveId !== null
  }
}
