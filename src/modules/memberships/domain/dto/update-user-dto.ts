/** Edita os dados cadastrais de outro usuário (`PATCH /users/:id`). */
export class UpdateUserDto {
  name?: string
  email?: string

  constructor(fields: { name?: string; email?: string }) {
    this.name = fields.name
    this.email = fields.email
  }
}
