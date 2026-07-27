import { z } from 'zod'
import { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { ContractError } from '@/core/errors/contract-error'
import { toIssueList } from '@/core/utils/zod-errors'
import type { ChangePasswordResult } from '@/modules/auth/domain/responses/change-password-response'

const changePasswordSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  forcePasswordChange: z.boolean().default(false),
  passwordChangedAt: z.string().nullable().default(null),
})

export function toChangePasswordResult(
  data: unknown,
): Either<DomainError, ChangePasswordResult> {
  const parsed = changePasswordSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(new ContractError('auth', toIssueList(parsed.error)))
  }

  return Either.right(parsed.data)
}
