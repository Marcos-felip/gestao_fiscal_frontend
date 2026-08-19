import type { MembershipRole } from '@/core/enums/membership-role.enum'

/** Altera o papel de um membro (`PATCH /memberships/:id/role`). */
export class UpdateMemberRoleDto {
  role: MembershipRole

  constructor(fields: { role: MembershipRole }) {
    this.role = fields.role
  }
}
