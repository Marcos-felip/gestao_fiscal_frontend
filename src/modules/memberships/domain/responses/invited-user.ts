import type { MembershipRole } from '@/enums/membership-role.enum'

/**
 * Resultado de `POST /users`: o usuário criado + a senha provisória
 * (retornada apenas uma vez, quando nenhuma senha é informada).
 */
export interface InvitedUser {
  id: string
  name: string
  email: string
  role: MembershipRole
  temporaryPassword: string | null
}
