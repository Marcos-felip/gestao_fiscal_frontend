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
  razaoSocial: 'JR Sistemas Comércio LTDA',
  nomeFantasia: 'JR Sistemas',
  inscricaoEstadual: '123456789012',
  inscricaoMunicipal: '7654321',
  crt: 'SIMPLES_NACIONAL',
  contribuinteIcms: true,
  codigoIbgeMunicipio: '3550308',
  telefoneFiscal: '(11) 3333-4444',
  emailFiscal: 'fiscal@jrsistemas.net',
  fiscalConfigComplete: true,
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

  it('lê os dados fiscais do emitente (crt, contribuinteIcms, indicador)', () => {
    const result = toCompany(respostaValida)

    expect(result.isRight).toBe(true)
    const company = result.right
    expect(company.crt).toBe('SIMPLES_NACIONAL')
    expect(company.contribuinteIcms).toBe(true)
    expect(company.codigoIbgeMunicipio).toBe('3550308')
    expect(company.inscricaoEstadual).toBe('123456789012')
    expect(company.emailFiscal).toBe('fiscal@jrsistemas.net')
    expect(company.fiscalConfigComplete).toBe(true)
  })

  it('aplica defaults quando os campos opcionais vêm ausentes', () => {
    const parcial = {
      id: 'company-2',
      name: 'Empresa Nova',
      stateRegistration: null,
    }

    const result = toCompany(parcial)

    expect(result.isRight).toBe(true)
    const company = result.right
    expect(company.type).toBeNull()
    expect(company.cnpj).toBeNull()
    expect(company.stateRegistration).toBeNull()
    expect(company.isOnboarded).toBe(false)
    // Dados fiscais ausentes viram default (null / false).
    expect(company.crt).toBeNull()
    expect(company.codigoIbgeMunicipio).toBeNull()
    expect(company.contribuinteIcms).toBe(false)
    expect(company.fiscalConfigComplete).toBe(false)
  })

  // `stateRegistration` é a IE do emitente, derivada da matriz pelo backend.
  // Antes ela tinha `.default(null)` no schema: campo ausente virava `null`
  // válido e o contrato quebrado passava sem ninguém notar.
  it('acusa ContractError quando stateRegistration vem ausente', () => {
    const semCampo = { ...respostaValida } as Record<string, unknown>
    delete semCampo.stateRegistration

    const result = toCompany(semCampo)

    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })

  it('aceita stateRegistration explicitamente nulo', () => {
    const result = toCompany({ ...respostaValida, stateRegistration: null })

    expect(result.isRight).toBe(true)
    expect(result.right.stateRegistration).toBeNull()
  })

  it('lê a IE da matriz devolvida pelo backend', () => {
    const result = toCompany({
      ...respostaValida,
      stateRegistration: '004684530',
    })

    expect(result.right.stateRegistration).toBe('004684530')
  })

  // A listagem não faz o join da matriz — o campo simplesmente não existe lá,
  // e exigi-lo quebraria o seletor de empresas.
  it('a listagem não exige stateRegistration', () => {
    const semCampo = { ...respostaValida } as Record<string, unknown>
    delete semCampo.stateRegistration

    const result = toCompanyList([semCampo])

    expect(result.isRight).toBe(true)
    expect(result.right[0].stateRegistration).toBeNull()
  })

  it('rejeita contribuinteIcms com tipo errado', () => {
    const result = toCompany({ ...respostaValida, contribuinteIcms: 'sim' })

    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })

  it('rejeita fiscalConfigComplete com tipo errado', () => {
    const result = toCompany({
      ...respostaValida,
      fiscalConfigComplete: 'talvez',
    })

    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
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
