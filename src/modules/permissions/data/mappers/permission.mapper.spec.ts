import { describe, it, expect } from 'vitest'
import {
  toPermissionCodes,
  toPermissionGroups,
} from '@/modules/permissions/data/mappers/permission.mapper'
import { ContractError } from '@/core/errors/contract-error'
import { PermissionGroup } from '@/modules/permissions/domain/entities/permission-group.entity'

describe('toPermissionCodes', () => {
  it('aceita um array de códigos', () => {
    const result = toPermissionCodes(['products.list', 'products.read'])
    expect(result.isRight).toBe(true)
    expect(result.right).toEqual(['products.list', 'products.read'])
  })

  it('rejeita um payload que não é array', () => {
    const result = toPermissionCodes({ foo: 'bar' })
    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })
})

describe('toPermissionGroups', () => {
  const grupoValido = [
    {
      domain: 'products',
      label: 'Produtos',
      permissions: [{ code: 'products.create', description: 'Criar produto' }],
    },
  ]

  it('constrói grupos a partir de resposta válida', () => {
    const result = toPermissionGroups(grupoValido)
    expect(result.isRight).toBe(true)
    expect(result.right[0]).toBeInstanceOf(PermissionGroup)
    expect(result.right[0].permissions[0].code).toBe('products.create')
  })

  it('usa descrição vazia quando ausente', () => {
    const result = toPermissionGroups([
      { domain: 'x', label: 'X', permissions: [{ code: 'x.read' }] },
    ])
    expect(result.isRight).toBe(true)
    expect(result.right[0].permissions[0].description).toBe('')
  })

  it('rejeita quando falta o domínio', () => {
    const result = toPermissionGroups([
      { label: 'X', permissions: [] },
    ])
    expect(result.isLeft).toBe(true)
    const error = result.left as ContractError
    expect(error.resource).toBe('permissions')
  })
})
