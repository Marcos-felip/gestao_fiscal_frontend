import type { MembershipRole } from '@/enums/membership-role.enum'

/**
 * Dados para criar um usuário e vinculá-lo à empresa ativa (`POST /users`).
 * `companyId` precisa ser a empresa ativa.
 */
export class CreateUserDto {
  name?: string
  email: string
  role: MembershipRole
  companyId: string
  forcePasswordChange?: boolean

  constructor(fields: {
    name?: string
    email: string
    role: MembershipRole
    companyId: string
    forcePasswordChange?: boolean
  }) {
    this.name = fields.name
    this.email = fields.email
    this.role = fields.role
    this.companyId = fields.companyId
    this.forcePasswordChange = fields.forcePasswordChange
  }
}
