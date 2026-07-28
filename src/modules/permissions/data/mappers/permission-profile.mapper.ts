import { z } from 'zod'
import { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { ContractError } from '@/core/errors/contract-error'
import { toIssueList } from '@/core/utils/zod-errors'
import {
  PermissionProfile,
  type ProfileRef,
} from '@/modules/permissions/domain/entities/permission-profile.entity'

const profileSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().default(null),
  permissionCodes: z.array(z.string()).default([]),
  membersCount: z.number().default(0),
  createdAt: z.string().nullable().default(null),
  updatedAt: z.string().nullable().default(null),
})

type ProfilePayload = z.infer<typeof profileSchema>

function build(value: ProfilePayload): PermissionProfile {
  return new PermissionProfile(
    value.id,
    value.name,
    value.description ?? '',
    value.permissionCodes,
    value.membersCount,
    value.createdAt,
    value.updatedAt,
  )
}

export function toPermissionProfile(
  data: unknown,
): Either<DomainError, PermissionProfile> {
  const parsed = profileSchema.safeParse(data)
  if (!parsed.success) {
    return Either.left(new ContractError('permission-profiles', toIssueList(parsed.error)))
  }
  return Either.right(build(parsed.data))
}

export function toPermissionProfileList(
  data: unknown,
): Either<DomainError, PermissionProfile[]> {
  const parsed = z.array(profileSchema).safeParse(data)
  if (!parsed.success) {
    return Either.left(new ContractError('permission-profiles', toIssueList(parsed.error)))
  }
  return Either.right(parsed.data.map(build))
}

const profileRefSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export function toProfileRefs(
  data: unknown,
): Either<DomainError, ProfileRef[]> {
  const parsed = z.array(profileRefSchema).safeParse(data)
  if (!parsed.success) {
    return Either.left(new ContractError('permission-profiles', toIssueList(parsed.error)))
  }
  return Either.right(parsed.data.map((p) => ({ id: p.id, name: p.name })))
}
