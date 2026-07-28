import { describe, expect, it } from 'vitest'
import {
  toPartner,
  toPartnerList,
} from '@/modules/partners/data/mappers/partner.mapper'
import { Partner } from '@/modules/partners/domain/entities/partner.entity'
import { ContractError } from '@/core/errors/contract-error'

const respostaValida = {
  id: 'par-1',
  companyId: 'comp-1',
  type: 'CLIENT',
  personType: 'PJ',
  name: 'Acme Ltda',
  tradeName: 'Acme',
  cpfCnpj: '11.222.333/0001-81',
  rgIe: '123456789',
  email: 'contato@acme.com',
  phone: '(11) 99999-9999',
  cep: '01001-000',
  street: 'Praça da Sé',
  number: '100',
  complement: null,
  neighborhood: 'Sé',
  city: 'São Paulo',
  state: 'SP',
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
}

describe('toPartner', () => {
  it('constrói a entidade a partir de uma resposta válida', () => {
    const result = toPartner(respostaValida)

    expect(result.isRight).toBe(true)
    const partner = result.right
    expect(partner).toBeInstanceOf(Partner)
    expect(partner.type).toBe('CLIENT')
    expect(partner.personType).toBe('PJ')
    expect(partner.location).toBe('São Paulo/SP')
  })

  it('aplica defaults quando campos opcionais vêm ausentes', () => {
    const result = toPartner({
      id: 'par-2',
      companyId: 'comp-1',
      type: 'SUPPLIER',
      personType: 'PF',
      name: 'João da Silva',
    })

    expect(result.isRight).toBe(true)
    expect(result.right.cpfCnpj).toBeNull()
    expect(result.right.tradeName).toBeNull()
    expect(result.right.city).toBeNull()
    expect(result.right.isActive).toBe(true)
  })

  it('rejeita resposta com campo de tipo errado (ContractError)', () => {
    const result = toPartner({ ...respostaValida, name: 123 })

    expect(result.isLeft).toBe(true)
    const error = result.left as ContractError
    expect(error).toBeInstanceOf(ContractError)
    expect(error.resource).toBe('partners')
    expect(error.issues.join(' ')).toContain('name')
  })

  it('rejeita resposta sem name e aponta o campo que falhou', () => {
    const { name: _name, ...semName } = respostaValida

    const result = toPartner(semName)

    expect(result.isLeft).toBe(true)
    const error = result.left as ContractError
    expect(error.resource).toBe('partners')
    expect(error.issues.join(' ')).toContain('name')
  })
})

describe('toPartnerList', () => {
  it('lê o envelope paginado e traduz data → items', () => {
    const result = toPartnerList({
      data: [
        respostaValida,
        {
          id: 'par-2',
          companyId: 'comp-1',
          type: 'BOTH',
          personType: 'PF',
          name: 'Maria',
        },
      ],
      total: 2,
      page: 1,
      limit: 20,
    })

    expect(result.isRight).toBe(true)
    const list = result.right
    expect(list.items).toHaveLength(2)
    expect(list.items[1]).toBeInstanceOf(Partner)
    expect(list.total).toBe(2)
    expect(list.page).toBe(1)
    expect(list.limit).toBe(20)
  })

  it('rejeita quando o envelope não tem total (ContractError)', () => {
    const result = toPartnerList({ data: [], page: 1, limit: 20 })

    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })

  it('rejeita quando o payload não é o envelope esperado', () => {
    const result = toPartnerList(respostaValida)

    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })
})
