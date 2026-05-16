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

  static fromJson(json: Record<string, unknown>): AuthUser {
    return new AuthUser(
      json.id as string,
      json.name as string,
      json.email as string,
      json.companyActiveId as string | null,
      json.role as string | null,
      json.forcePasswordChange as boolean,
    )
  }

  get hasActiveCompany(): boolean {
    return this.companyActiveId !== null
  }
}
