import { MembershipRole } from '@/enums/membership-role.enum'

/**
 * Vínculo de um usuário com a empresa ativa (`GET /memberships`).
 * Os dados do usuário vêm achatados a partir de `user`.
 */
export class Membership {
  readonly id: string
  readonly userId: string
  readonly role: MembershipRole
  readonly userName: string
  readonly userEmail: string
  readonly createdAt: string | null

  constructor(
    id: string,
    userId: string,
    role: MembershipRole,
    userName: string,
    userEmail: string,
    createdAt: string | null,
  ) {
    this.id = id
    this.userId = userId
    this.role = role
    this.userName = userName
    this.userEmail = userEmail
    this.createdAt = createdAt
  }

  /** OWNER não pode ter o papel alterado nem ser removido. */
  get isOwner(): boolean {
    return this.role === MembershipRole.OWNER
  }

  /** Iniciais para o avatar (máx. 2 letras). */
  get initials(): string {
    const parts = this.userName.trim().split(/\s+/)
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
  }
}
