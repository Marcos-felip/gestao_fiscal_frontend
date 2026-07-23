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

  get hasActiveCompany(): boolean {
    return this.companyActiveId !== null
  }
}
