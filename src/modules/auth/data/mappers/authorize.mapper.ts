import { z } from 'zod'
import { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { ContractError } from '@/core/errors/contract-error'
import type { AuthorizeResult } from '@/modules/auth/domain/responses/authorize-response'
import { toIssueList } from '@/core/utils/zod-errors'

const authorizeSchema = z.object({
  authorized: z.boolean(),
  name: z.string().nullable().default(null),
  role: z.string().nullable().default(null),
})

export function toAuthorizeResult(
  data: unknown,
): Either<DomainError, AuthorizeResult> {
  const parsed = authorizeSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(new ContractError('auth', toIssueList(parsed.error)))
  }

  return Either.right({
    authorized: parsed.data.authorized,
    name: parsed.data.name ?? '',
    role: parsed.data.role,
  })
}
