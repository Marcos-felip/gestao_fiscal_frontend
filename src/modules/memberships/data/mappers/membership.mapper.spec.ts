import { describe, it, expect } from 'vitest'
import {
  toMembership,
  toMembershipList,
  toCreatedUser,
} from '@/modules/memberships/data/mappers/membership.mapper'
import { ContractError } from '@/core/errors/contract-error'
import { Membership } from '@/modules/memberships/domain/entities/membership.entity'

const membershipValido = {
  id: 'm1',
  userId: 'u1',
  role: 'ADMIN',
  createdAt: '2026-01-01T00:00:00.000Z',
  user: { id: 'u1', name: 'Ana Silva', email: 'ana@ex.com' },
}

describe('toMembership', () => {
  it('achata os dados do usuário na entidade', () => {
    const result = toMembership(membershipValido)
    expect(result.isRight).toBe(true)
    expect(result.right).toBeInstanceOf(Membership)
    expect(result.right.userName).toBe('Ana Silva')
    expect(result.right.userEmail).toBe('ana@ex.com')
    expect(result.right.isOwner).toBe(false)
    expect(result.right.initials).toBe('AS')
  })

  it('rejeita quando falta o usuário', () => {
    const result = toMembership({ id: 'm1', userId: 'u1', role: 'ADMIN' })
    expect(result.isLeft).toBe(true)
    const error = result.left as ContractError
    expect(error.resource).toBe('memberships')
  })
})

describe('toMembershipList', () => {
  it('mapeia uma lista', () => {
    const result = toMembershipList([membershipValido])
    expect(result.isRight).toBe(true)
    expect(result.right).toHaveLength(1)
  })

  it('rejeita payload que não é array', () => {
    const result = toMembershipList(membershipValido)
    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })
})

describe('toCreatedUser', () => {
  it('lê a senha provisória quando presente', () => {
    const result = toCreatedUser({
      id: 'u2',
      name: 'Beto',
      email: 'beto@ex.com',
      role: 'MEMBER',
      temporaryPassword: 'Provisoria1',
    })
    expect(result.isRight).toBe(true)
    expect(result.right.temporaryPassword).toBe('Provisoria1')
  })

  it('usa null quando a senha provisória está ausente', () => {
    const result = toCreatedUser({
      id: 'u2',
      name: 'Beto',
      email: 'beto@ex.com',
      role: 'MEMBER',
    })
    expect(result.isRight).toBe(true)
    expect(result.right.temporaryPassword).toBeNull()
  })
})
