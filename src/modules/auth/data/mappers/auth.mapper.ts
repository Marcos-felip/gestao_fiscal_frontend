import { z } from 'zod'
import { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { ContractError } from '@/core/errors/contract-error'
import { AuthUser } from '@/modules/auth/domain/entities/auth.entity'
import type { AuthResponse } from '@/modules/auth/domain/responses/auth-response'
import { toIssueList } from '@/core/utils/zod-errors'

const authResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    companyActiveId: z.string().nullable().default(null),
    role: z.string().nullable().default(null),
    forcePasswordChange: z.boolean().default(false),
  }),
})

export function toAuthResponse(
  data: unknown,
): Either<DomainError, AuthResponse> {
  const parsed = authResponseSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(new ContractError('auth', toIssueList(parsed.error)))
  }

  const value = parsed.data
  return Either.right({
    token: {
      accessToken: value.accessToken,
      refreshToken: value.refreshToken,
    },
    user: new AuthUser(
      value.user.id,
      value.user.name,
      value.user.email,
      value.user.companyActiveId,
      value.user.role,
      value.user.forcePasswordChange,
    ),
  })
}
