import { z } from 'zod'
import { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { ContractError } from '@/core/errors/contract-error'
import { toIssueList } from '@/core/utils/zod-errors'
import type { MembershipRole } from '@/core/enums/membership-role.enum'
import { Membership } from '@/modules/memberships/domain/entities/membership.entity'
import type { CreatedUser } from '@/modules/memberships/domain/responses/created-user'
import type { UpdatedUser } from '@/modules/memberships/domain/responses/updated-user'

const membershipSchema = z.object({
  id: z.string(),
  userId: z.string(),
  role: z.string(),
  createdAt: z.string().nullable().default(null),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  }),
  profiles: z.array(z.object({ id: z.string(), name: z.string() })).default([]),
})

type MembershipPayload = z.infer<typeof membershipSchema>

function build(value: MembershipPayload): Membership {
  return new Membership(
    value.id,
    value.userId,
    value.role as MembershipRole,
    value.user.name,
    value.user.email,
    value.createdAt,
    value.profiles,
  )
}

export function toMembership(data: unknown): Either<DomainError, Membership> {
  const parsed = membershipSchema.safeParse(data)
  if (!parsed.success) {
    return Either.left(
      new ContractError('memberships', toIssueList(parsed.error)),
    )
  }
  return Either.right(build(parsed.data))
}

export function toMembershipList(
  data: unknown,
): Either<DomainError, Membership[]> {
  const parsed = z.array(membershipSchema).safeParse(data)
  if (!parsed.success) {
    return Either.left(
      new ContractError('memberships', toIssueList(parsed.error)),
    )
  }
  return Either.right(parsed.data.map(build))
}

const updatedUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
})

export function toUpdatedUser(data: unknown): Either<DomainError, UpdatedUser> {
  const parsed = updatedUserSchema.safeParse(data)
  if (!parsed.success) {
    return Either.left(
      new ContractError('memberships', toIssueList(parsed.error)),
    )
  }
  const value = parsed.data
  return Either.right({ id: value.id, name: value.name, email: value.email })
}

const createdUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string(),
  temporaryPassword: z.string().nullable().default(null),
})

export function toCreatedUser(data: unknown): Either<DomainError, CreatedUser> {
  const parsed = createdUserSchema.safeParse(data)
  if (!parsed.success) {
    return Either.left(
      new ContractError('memberships', toIssueList(parsed.error)),
    )
  }
  const value = parsed.data
  return Either.right({
    id: value.id,
    name: value.name,
    email: value.email,
    role: value.role as MembershipRole,
    temporaryPassword: value.temporaryPassword,
  })
}
