import { describe, expect, it } from 'vitest'
import {
  toEstablishment,
  toEstablishmentList,
} from '@/modules/establishments/data/mappers/establishment.mapper'
import { Establishment } from '@/modules/establishments/domain/entities/establishment.entity'
import { ContractError } from '@/core/errors/contract-error'

const respostaValida = {
  id: 'est-1',
  name: 'Matriz',
  type: 'MATRIZ',
  cnpj: '11.222.333/0001-81',
  inscricaoEstadual: '123456789',
  inscricaoMunicipal: null,
  cep: '01001-000',
  street: 'Praça da Sé',
  number: '100',
  complement: null,
  neighborhood: 'Sé',
  city: 'São Paulo',
  state: 'SP',
  createdAt: '2026-01-01T00:00:00.000Z',
}

describe('toEstablishment', () => {
  it('constrói a entidade a partir de uma resposta válida', () => {
    const result = toEstablishment(respostaValida)

    expect(result.isRight).toBe(true)
    const establishment = result.right
    expect(establishment).toBeInstanceOf(Establishment)
    expect(establishment.isMatriz).toBe(true)
    expect(establishment.location).toBe('São Paulo/SP')
  })

  it('aplica defaults quando campos opcionais vêm ausentes', () => {
    const result = toEstablishment({
      id: 'est-2',
      name: 'Filial',
      type: 'FILIAL',
    })

    expect(result.isRight).toBe(true)
    expect(result.right.cnpj).toBeNull()
    expect(result.right.city).toBeNull()
    expect(result.right.isMatriz).toBe(false)
  })

  it('rejeita resposta sem name e aponta o campo que falhou', () => {
    const { name: _name, ...semName } = respostaValida

    const result = toEstablishment(semName)

    expect(result.isLeft).toBe(true)
    const error = result.left as ContractError
    expect(error.resource).toBe('establishments')
    expect(error.issues.join(' ')).toContain('name')
  })
})

describe('toEstablishmentList', () => {
  it('mapeia um array de estabelecimentos', () => {
    const result = toEstablishmentList([
      respostaValida,
      { id: 'est-2', name: 'Filial', type: 'FILIAL' },
    ])

    expect(result.isRight).toBe(true)
    expect(result.right).toHaveLength(2)
    expect(result.right[1]).toBeInstanceOf(Establishment)
  })

  it('rejeita quando o payload não é um array', () => {
    const result = toEstablishmentList(respostaValida)

    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })
})
