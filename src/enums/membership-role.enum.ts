export const MembershipRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
} as const

export type MembershipRole = (typeof MembershipRole)[keyof typeof MembershipRole]