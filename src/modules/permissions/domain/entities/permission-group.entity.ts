export interface PermissionItem {
  code: string
  description: string
}

export class PermissionGroup {
  readonly domain: string
  readonly label: string
  readonly permissions: PermissionItem[]

  constructor(domain: string, label: string, permissions: PermissionItem[]) {
    this.domain = domain
    this.label = label
    this.permissions = permissions
  }
}
