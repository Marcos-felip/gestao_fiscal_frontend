import { z } from 'zod'
import { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { ContractError } from '@/core/errors/contract-error'
import { toIssueList } from '@/core/utils/zod-errors'
import type { MembershipRole } from '@/enums/membership-role.enum'
import { Membership } from '@/modules/memberships/domain/entities/membership.entity'
import type { InvitedUser } from '@/modules/memberships/domain/responses/invited-user'

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
  )
}

export function toMembership(data: unknown): Either<DomainError, Membership> {
  const parsed = membershipSchema.safeParse(data)
  if (!parsed.success) {
    return Either.left(new ContractError('memberships', toIssueList(parsed.error)))
  }
  return Either.right(build(parsed.data))
}

export function toMembershipList(
  data: unknown,
): Either<DomainError, Membership[]> {
  const parsed = z.array(membershipSchema).safeParse(data)
  if (!parsed.success) {
    return Either.left(new ContractError('memberships', toIssueList(parsed.error)))
  }
  return Either.right(parsed.data.map(build))
}

const invitedUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string(),
  temporaryPassword: z.string().nullable().default(null),
})

export function toInvitedUser(data: unknown): Either<DomainError, InvitedUser> {
  const parsed = invitedUserSchema.safeParse(data)
  if (!parsed.success) {
    return Either.left(new ContractError('memberships', toIssueList(parsed.error)))
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
