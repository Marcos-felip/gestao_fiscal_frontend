import { z } from 'zod'
import { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { ContractError } from '@/core/errors/contract-error'
import { AccountProfile } from '@/modules/account/domain/entities/account-profile.entity'
import { toIssueList } from '@/core/utils/zod-errors'

const profileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  companyActiveId: z.string().nullable().default(null),
  createdAt: z.string().nullable().default(null),
  updatedAt: z.string().nullable().default(null),
})

export function toAccountProfile(
  data: unknown,
): Either<DomainError, AccountProfile> {
  const parsed = profileSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(new ContractError('account', toIssueList(parsed.error)))
  }

  const value = parsed.data
  return Either.right(
    new AccountProfile(
      value.id,
      value.name,
      value.email,
      value.companyActiveId,
      value.createdAt,
      value.updatedAt,
    ),
  )
}
