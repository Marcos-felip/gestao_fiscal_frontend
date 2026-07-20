import type { AuthUser } from '@/modules/auth/domain/entities/auth.entity'

/**
 * Par de tokens de autenticação (valor sem identidade própria).
 */
export interface AuthToken {
  accessToken: string
  refreshToken: string
}

/**
 * Resultado de um fluxo de autenticação (login, registro, refresh).
 */
export interface AuthResult {
  token: AuthToken
  user: AuthUser
}
