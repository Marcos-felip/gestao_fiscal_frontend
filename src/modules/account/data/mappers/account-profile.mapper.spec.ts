import { describe, expect, it } from 'vitest'
import { toAccountProfile } from '@/modules/account/data/mappers/account-profile.mapper'
import { AccountProfile } from '@/modules/account/domain/entities/account-profile.entity'
import { ContractError } from '@/core/errors/contract-error'

const respostaValida = {
  id: 'usr-1',
  name: 'João da Silva',
  email: 'joao@exemplo.com',
  companyActiveId: 'comp-1',
  forcePasswordChange: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  memberships: [{ id: 'm-1', companyId: 'comp-1', role: 'OWNER' }],
}

describe('toAccountProfile', () => {
  it('constrói o perfil ignorando campos extras (memberships, etc.)', () => {
    const result = toAccountProfile(respostaValida)

    expect(result.isRight).toBe(true)
    const profile = result.right
    expect(profile).toBeInstanceOf(AccountProfile)
    expect(profile.name).toBe('João da Silva')
    expect(profile.email).toBe('joao@exemplo.com')
    expect(profile.companyActiveId).toBe('comp-1')
  })

  it('aplica defaults quando campos opcionais vêm ausentes (resposta do PATCH)', () => {
    const result = toAccountProfile({
      id: 'usr-2',
      name: 'Maria',
      email: 'maria@exemplo.com',
    })

    expect(result.isRight).toBe(true)
    expect(result.right.companyActiveId).toBeNull()
    expect(result.right.createdAt).toBeNull()
  })

  it('rejeita resposta sem email (ContractError)', () => {
    const { email: _email, ...semEmail } = respostaValida

    const result = toAccountProfile(semEmail)

    expect(result.isLeft).toBe(true)
    const error = result.left as ContractError
    expect(error).toBeInstanceOf(ContractError)
    expect(error.resource).toBe('account')
    expect(error.issues.join(' ')).toContain('email')
  })
})
