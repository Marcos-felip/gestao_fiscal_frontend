export class ProfileInputDto {
  name?: string
  description?: string
  permissionCodes?: string[]

  constructor(fields: {
    name?: string
    description?: string
    permissionCodes?: string[]
  }) {
    this.name = fields.name
    this.description = fields.description
    this.permissionCodes = fields.permissionCodes
  }
}
