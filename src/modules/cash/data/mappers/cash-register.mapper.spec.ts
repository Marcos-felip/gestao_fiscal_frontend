import { describe, expect, it } from 'vitest'
import {
  toCashRegister,
  toCashRegisterList,
} from '@/modules/cash/data/mappers/cash-register.mapper'
import { ContractError } from '@/core/errors/contract-error'

describe('toCashRegister', () => {
  it('mapeia o caixa e achata o nome do estabelecimento', () => {
    const result = toCashRegister({
      id: 'cr-1',
      establishmentId: 'est-1',
      establishment: { id: 'est-1', name: 'Loja Centro' },
      name: 'Caixa 01',
      isActive: true,
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-01T00:00:00.000Z',
    })

    expect(result.isRight).toBe(true)
    const register = result.right
    expect(register.name).toBe('Caixa 01')
    expect(register.establishmentName).toBe('Loja Centro')
    expect(register.isActive).toBe(true)
  })

  it('aplica defaults quando falta a relação e o ativo', () => {
    const result = toCashRegister({ id: 'cr-2', name: 'Caixa 02' })

    expect(result.isRight).toBe(true)
    expect(result.right.establishmentName).toBeNull()
    expect(result.right.isActive).toBe(true)
  })

  it('devolve ContractError quando o payload é inválido', () => {
    const result = toCashRegister({ name: 'Sem id' })
    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })
})

describe('toCashRegisterList', () => {
  it('mapeia o array cru (não paginado)', () => {
    const result = toCashRegisterList([
      { id: 'cr-1', name: 'Caixa 01', isActive: true },
      { id: 'cr-2', name: 'Caixa 02', isActive: false },
    ])

    expect(result.isRight).toBe(true)
    expect(result.right).toHaveLength(2)
    expect(result.right[1].isActive).toBe(false)
  })

  it('devolve ContractError quando não é um array', () => {
    const result = toCashRegisterList({ data: 'nope' })
    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })
})
