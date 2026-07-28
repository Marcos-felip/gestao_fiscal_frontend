import { describe, it, expect } from 'vitest'
import {
  toPermissionProfile,
  toPermissionProfileList,
  toProfileRefs,
} from '@/modules/permissions/data/mappers/permission-profile.mapper'
import { ContractError } from '@/core/errors/contract-error'
import { PermissionProfile } from '@/modules/permissions/domain/entities/permission-profile.entity'

const perfilValido = {
  id: 'p1',
  name: 'Estoquista',
  description: 'Acesso ao estoque',
  permissionCodes: ['products.list', 'stock.create'],
  membersCount: 3,
  createdAt: '2026-07-28T12:00:00.000Z',
  updatedAt: '2026-07-28T12:00:00.000Z',
}

describe('toPermissionProfile', () => {
  it('constrói o perfil a partir de resposta válida', () => {
    const result = toPermissionProfile(perfilValido)
    expect(result.isRight).toBe(true)
    expect(result.right).toBeInstanceOf(PermissionProfile)
    expect(result.right.permissionsCount).toBe(2)
  })

  it('normaliza description ausente para string vazia', () => {
    const result = toPermissionProfile({
      id: 'p2',
      name: 'Comprador',
    })
    expect(result.isRight).toBe(true)
    expect(result.right.description).toBe('')
    expect(result.right.permissionCodes).toEqual([])
    expect(result.right.membersCount).toBe(0)
  })

  it('rejeita quando falta o id', () => {
    const result = toPermissionProfile({ name: 'X' })
    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })
})

describe('toPermissionProfileList', () => {
  it('mapeia uma lista de perfis', () => {
    const result = toPermissionProfileList([perfilValido])
    expect(result.isRight).toBe(true)
    expect(result.right).toHaveLength(1)
    expect(result.right[0].name).toBe('Estoquista')
  })

  it('rejeita quando não é array', () => {
    const result = toPermissionProfileList({ foo: 'bar' })
    expect(result.isLeft).toBe(true)
  })
})

describe('toProfileRefs', () => {
  it('extrai apenas id e nome, ignorando campos extras', () => {
    const result = toProfileRefs([
      { id: 'p1', name: 'Estoquista', description: 'ignorado' },
    ])
    expect(result.isRight).toBe(true)
    expect(result.right).toEqual([{ id: 'p1', name: 'Estoquista' }])
  })

  it('rejeita quando falta o nome', () => {
    const result = toProfileRefs([{ id: 'p1' }])
    expect(result.isLeft).toBe(true)
    const error = result.left as ContractError
    expect(error.resource).toBe('permission-profiles')
  })
})
