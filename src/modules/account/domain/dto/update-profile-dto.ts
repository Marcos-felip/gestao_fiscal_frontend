export class UpdateProfileDto {
  name?: string
  email?: string

  constructor(fields: { name?: string; email?: string }) {
    this.name = fields.name
    this.email = fields.email
  }
}
