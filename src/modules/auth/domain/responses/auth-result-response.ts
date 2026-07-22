import type { AuthToken } from '@/modules/auth/domain/responses/auth-token-response'

export interface AuthResult {
  token: AuthToken
  user: {
    id: string
    name: string
    email: string
    companyActiveId: string | null
    role: string | null
    forcePasswordChange: boolean
    hasActiveCompany: boolean
  }
}
