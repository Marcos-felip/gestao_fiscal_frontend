export class PermissionProfile {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly permissionCodes: string[]
  readonly membersCount: number
  readonly createdAt: string | null
  readonly updatedAt: string | null

  constructor(
    id: string,
    name: string,
    description: string,
    permissionCodes: string[],
    membersCount: number,
    createdAt: string | null,
    updatedAt: string | null,
  ) {
    this.id = id
    this.name = name
    this.description = description
    this.permissionCodes = permissionCodes
    this.membersCount = membersCount
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  get permissionsCount(): number {
    return this.permissionCodes.length
  }
}

/** Referência enxuta de um perfil (id + nome), usada em vínculos de membros. */
export interface ProfileRef {
  id: string
  name: string
}
