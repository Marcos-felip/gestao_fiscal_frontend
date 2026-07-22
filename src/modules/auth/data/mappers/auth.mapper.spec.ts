import { describe, expect, it } from 'vitest'
import { toAuthResult } from '@/modules/auth/data/mappers/auth.mapper'
import { AuthUser } from '@/modules/auth/domain/entities/auth.entity'
import { ContractError } from '@/core/errors/contract-error'

const respostaValida = {
  id: 'user-1',
  name: 'Marcos',
  email: 'marcos@jrsistemas.net',
  companyActiveId: 'company-1',
  role: 'OWNER',
  forcePasswordChange: false,
  accessToken: 'access-abc',
  refreshToken: 'refresh-xyz',
}

describe('toAuthResult', () => {
  it('constrói AuthUser e token a partir de uma resposta válida', () => {
    const result = toAuthResult(respostaValida)

    expect(result.isRight).toBe(true)
    const { token, user } = result.right
    expect(token).toEqual({
      accessToken: 'access-abc',
      refreshToken: 'refresh-xyz',
    })
    expect(user).toBeInstanceOf(AuthUser)
    expect(user.id).toBe('user-1')
    expect(user.hasActiveCompany).toBe(true)
  })

  it('aplica defaults quando os campos opcionais vêm ausentes', () => {
    const { companyActiveId: _c, role: _r, ...semOpcionais } = respostaValida
    const parcial = { ...semOpcionais, forcePasswordChange: undefined }

    const result = toAuthResult(parcial)

    expect(result.isRight).toBe(true)
    expect(result.right.user.companyActiveId).toBeNull()
    expect(result.right.user.role).toBeNull()
    expect(result.right.user.forcePasswordChange).toBe(false)
    expect(result.right.user.hasActiveCompany).toBe(false)
  })

  // Regressão: antes do mapper Zod isso era um `as boolean` que passava batido.
  it('rejeita forcePasswordChange com tipo errado', () => {
    const result = toAuthResult({
      ...respostaValida,
      forcePasswordChange: 'sim',
    })

    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })

  it('rejeita resposta sem accessToken e aponta o campo que falhou', () => {
    const { accessToken: _a, ...semToken } = respostaValida

    const result = toAuthResult(semToken)

    expect(result.isLeft).toBe(true)
    const error = result.left as ContractError
    expect(error.resource).toBe('auth')
    expect(error.issues.join(' ')).toContain('accessToken')
  })

  it('marca falha de contrato como não exibível ao usuário', () => {
    const result = toAuthResult({ qualquer: 'coisa' })

    expect(result.isLeft).toBe(true)
    expect(result.left.isUserFacing).toBe(false)
  })

  it('rejeita payload que não é objeto', () => {
    expect(toAuthResult(null).isLeft).toBe(true)
    expect(toAuthResult('texto').isLeft).toBe(true)
    expect(toAuthResult(undefined).isLeft).toBe(true)
  })
})
