import { z } from 'zod'
import { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { ContractError } from '@/core/errors/contract-error'
import { toIssueList } from '@/core/utils/zod-errors'
import { PermissionGroup } from '@/modules/permissions/domain/entities/permission-group.entity'

const codesSchema = z.array(z.string())

const groupSchema = z.object({
  domain: z.string(),
  label: z.string(),
  permissions: z.array(
    z.object({
      code: z.string(),
      description: z.string().default(''),
    }),
  ),
})

export function toPermissionCodes(
  data: unknown,
): Either<DomainError, string[]> {
  const parsed = codesSchema.safeParse(data)
  if (!parsed.success) {
    return Either.left(new ContractError('permissions', toIssueList(parsed.error)))
  }
  return Either.right(parsed.data)
}

export function toPermissionGroups(
  data: unknown,
): Either<DomainError, PermissionGroup[]> {
  const parsed = z.array(groupSchema).safeParse(data)
  if (!parsed.success) {
    return Either.left(new ContractError('permissions', toIssueList(parsed.error)))
  }
  return Either.right(
    parsed.data.map((g) => new PermissionGroup(g.domain, g.label, g.permissions)),
  )
}
