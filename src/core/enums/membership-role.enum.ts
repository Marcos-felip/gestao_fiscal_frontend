export const MembershipRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
} as const

export type MembershipRole =
  (typeof MembershipRole)[keyof typeof MembershipRole]

export const membershipRoleLabels: Record<MembershipRole, string> = {
  OWNER: 'Proprietário',
  ADMIN: 'Administrador',
  MEMBER: 'Membro',
}

export const membershipRoleOptions: { value: MembershipRole; label: string }[] =
  [
    { value: MembershipRole.OWNER, label: membershipRoleLabels.OWNER },
    { value: MembershipRole.ADMIN, label: membershipRoleLabels.ADMIN },
    { value: MembershipRole.MEMBER, label: membershipRoleLabels.MEMBER },
  ]

/** Hierarquia: quanto maior o número, mais poder. */
export const roleRank: Record<MembershipRole, number> = {
  OWNER: 3,
  ADMIN: 2,
  MEMBER: 1,
}

/**
 * Papéis que um ator pode atribuir: nunca OWNER e nunca superior ao próprio
 * (espelha a validação de hierarquia do backend).
 */
export function assignableRoles(actor: MembershipRole | null): MembershipRole[] {
  if (!actor) return []
  const actorRank = roleRank[actor]
  return (Object.values(MembershipRole) as MembershipRole[]).filter(
    (role) => role !== MembershipRole.OWNER && roleRank[role] <= actorRank,
  )
}
