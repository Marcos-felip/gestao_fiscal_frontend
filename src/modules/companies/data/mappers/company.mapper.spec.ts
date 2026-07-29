import { describe, expect, it } from 'vitest'
import {
  toCompany,
  toCompanyList,
  toCreatedCompany,
} from '@/modules/companies/data/mappers/company.mapper'
import { Company } from '@/modules/companies/domain/entities/company.entity'
import { ContractError } from '@/core/errors/contract-error'

const respostaValida = {
  id: 'company-1',
  name: 'JR Sistemas',
  type: 'LTDA',
  cnpj: '11.222.333/0001-81',
  stateRegistration: '123456789012',
  phone: '(11) 98765-4321',
  taxRegime: 'SIMPLES_NACIONAL',
  businessSegment: 'GENERICO',
  isOnboarded: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
}

describe('toCompany', () => {
  it('constrói a entidade Company a partir de uma resposta válida', () => {
    const result = toCompany(respostaValida)

    expect(result.isRight).toBe(true)
    const company = result.right
    expect(company).toBeInstanceOf(Company)
    expect(company.id).toBe('company-1')
    expect(company.type).toBe('LTDA')
    expect(company.taxRegime).toBe('SIMPLES_NACIONAL')
    expect(company.isConfigured).toBe(true)
  })

  it('aplica defaults quando os campos opcionais vêm ausentes', () => {
    const parcial = { id: 'company-2', name: 'Empresa Nova' }

    const result = toCompany(parcial)

    expect(result.isRight).toBe(true)
    const company = result.right
    expect(company.type).toBeNull()
    expect(company.cnpj).toBeNull()
    expect(company.stateRegistration).toBeNull()
    expect(company.isOnboarded).toBe(false)
  })

  it('rejeita isOnboarded com tipo errado', () => {
    const result = toCompany({ ...respostaValida, isOnboarded: 'sim' })

    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })

  it('rejeita resposta sem name e aponta o campo que falhou', () => {
    const { name: _name, ...semName } = respostaValida

    const result = toCompany(semName)

    expect(result.isLeft).toBe(true)
    const error = result.left as ContractError
    expect(error.resource).toBe('companies')
    expect(error.issues.join(' ')).toContain('name')
  })

  it('marca falha de contrato como não exibível ao usuário', () => {
    const result = toCompany({ qualquer: 'coisa' })

    expect(result.isLeft).toBe(true)
    expect(result.left.isUserFacing).toBe(false)
  })

  it('rejeita payload que não é objeto', () => {
    expect(toCompany(null).isLeft).toBe(true)
    expect(toCompany('texto').isLeft).toBe(true)
    expect(toCompany(undefined).isLeft).toBe(true)
  })
})

describe('toCompanyList', () => {
  it('mapeia um array simples de empresas (GET /companies)', () => {
    const result = toCompanyList([
      respostaValida,
      { id: 'company-2', name: 'Segunda Empresa' },
    ])

    expect(result.isRight).toBe(true)
    const list = result.right
    expect(list).toHaveLength(2)
    expect(list[0]).toBeInstanceOf(Company)
    expect(list[1].name).toBe('Segunda Empresa')
    expect(list[1].isOnboarded).toBe(false)
  })

  it('rejeita quando o payload não é um array', () => {
    const result = toCompanyList(respostaValida)

    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })
})

describe('toCreatedCompany', () => {
  it('extrai a empresa do envelope { company, membership }', () => {
    const result = toCreatedCompany({
      company: respostaValida,
      membership: { id: 'm-1', role: 'OWNER' },
    })

    expect(result.isRight).toBe(true)
    expect(result.right).toBeInstanceOf(Company)
    expect(result.right.id).toBe('company-1')
  })

  it('rejeita quando falta a chave company', () => {
    const result = toCreatedCompany(respostaValida)

    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })
})
