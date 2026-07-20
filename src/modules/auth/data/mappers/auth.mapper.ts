import { z } from 'zod'
import { Either } from '@/core/either/either'
import { AuthUser } from '@/modules/auth/domain/entities/auth.entity'
import type { AuthResult } from '@/modules/auth/domain/types/auth.types'

const authResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  companyActiveId: z.string().nullable().default(null),
  role: z.string().nullable().default(null),
  forcePasswordChange: z.boolean().default(false),
  accessToken: z.string(),
  refreshToken: z.string(),
})

export function toAuthResult(data: unknown): Either<Error, AuthResult> {
  const parsed = authResponseSchema.safeParse(data)
  if (!parsed.success) {
    return Either.left(new Error('Resposta de autenticação inválida'))
  }

  const value = parsed.data
  return Either.right({
    token: {
      accessToken: value.accessToken,
      refreshToken: value.refreshToken,
    },
    user: new AuthUser(
      value.id,
      value.name,
      value.email,
      value.companyActiveId,
      value.role,
      value.forcePasswordChange,
    ),
  })
}
