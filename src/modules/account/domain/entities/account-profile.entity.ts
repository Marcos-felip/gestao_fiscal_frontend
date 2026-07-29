export class AccountProfile {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly companyActiveId: string | null
  readonly createdAt: string | null
  readonly updatedAt: string | null

  constructor(
    id: string,
    name: string,
    email: string,
    companyActiveId: string | null,
    createdAt: string | null,
    updatedAt: string | null,
  ) {
    this.id = id
    this.name = name
    this.email = email
    this.companyActiveId = companyActiveId
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }
}
