import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Either } from '@/core/either/either'
import { StorageService } from '@/core/utils/storage'
import { Company } from '@/modules/companies/domain/entities/company.entity'
import { Establishment } from '@/modules/establishments/domain/entities/establishment.entity'
import { CompanyController } from './company-controller'

/**
 * Regressão do sintoma "a Inscrição Estadual some ao recarregar".
 *
 * A IE do emitente mora no estabelecimento matriz, mas é editada no formulário
 * da empresa. O backend aceita gravá-la por `stateRegistration` no PATCH da
 * empresa e não a devolve com esse nome na leitura — quem a repõe é a matriz.
 */

const COMPANY_ID = 'company-1'
const IE_MATRIZ = '004684530.00-54'

const company = (stateRegistration: string | null = null) =>
  new Company(
    COMPANY_ID,
    'Sal e Fogo Braga LTDA',
    null,
    '51720322000146',
    stateRegistration,
    null,
    null,
    null,
    true,
    'Sal e Fogo Braga LTDA',
    'Sal e Fogo Braga',
    null,
    null,
    null,
    false,
    '3143302',
    null,
    null,
    false,
    null,
    null,
  )

const matriz = (inscricaoEstadual: string | null = IE_MATRIZ) =>
  new Establishment(
    'estab-1',
    'Sal e Fogo Braga LTDA',
    'MATRIZ',
    '51720322000146',
    inscricaoEstadual,
    '123456',
    '39400347',
    'Rua Joviniano Ramos',
    '446',
    null,
    'São José',
    'Montes Claros',
    'MG',
    null,
  )

const build = (options: { matriz?: Establishment | null } = {}) => {
  const estabelecimento =
    options.matriz === undefined ? matriz() : options.matriz

  const getCompany = { execute: vi.fn() }
  const updateCompany = { execute: vi.fn() }
  const listEstablishments = { execute: vi.fn() }
  const updateEstablishment = { execute: vi.fn() }

  getCompany.execute.mockResolvedValue(Either.right(company()))
  listEstablishments.execute.mockResolvedValue(
    Either.right(estabelecimento ? [estabelecimento] : []),
  )

  const controller = new CompanyController(
    getCompany as never,
    updateCompany as never,
    listEstablishments as never,
    updateEstablishment as never,
  )

  return { controller, getCompany, updateCompany, updateEstablishment }
}

describe('CompanyController — Inscrição Estadual da matriz', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.spyOn(StorageService, 'getActiveCompanyId').mockReturnValue(COMPANY_ID)
  })

  it('preenche a IE do formulário a partir da matriz', async () => {
    const { controller } = build()

    await controller.loadCompany()

    expect(controller.values.value.stateRegistration).toBe(IE_MATRIZ)
  })

  it('a matriz vence o valor vindo da empresa', async () => {
    const { controller, getCompany } = build()
    getCompany.execute.mockResolvedValue(Either.right(company('999999999')))

    await controller.loadCompany()

    expect(controller.values.value.stateRegistration).toBe(IE_MATRIZ)
  })

  it('deixa o campo vazio quando a matriz não tem IE', async () => {
    const { controller } = build({ matriz: matriz(null) })

    await controller.loadCompany()

    expect(controller.values.value.stateRegistration).toBe('')
  })

  it('não quebra o carregamento quando a empresa não tem matriz', async () => {
    const { controller } = build({ matriz: null })

    await controller.loadCompany()

    expect(controller.loaded.value).toBe(true)
    expect(controller.hasMatriz.value).toBe(false)
    expect(controller.values.value.stateRegistration).toBe('')
  })

  it('mantém a IE no formulário depois de salvar', async () => {
    const { controller, updateCompany, updateEstablishment } = build()
    const nova = '004684530.00-99'

    await controller.loadCompany()

    updateCompany.execute.mockResolvedValue(Either.right(company()))
    updateEstablishment.execute.mockResolvedValue(Either.right(matriz(nova)))

    await controller.save({
      company: { ...controller.values.value, stateRegistration: nova },
      sede: controller.sede.value,
    })

    // `applyCompany` repõe o formulário com a resposta da empresa, que não traz
    // a IE; é `applySede` que a devolve. Sem isso o campo esvaziava ao salvar.
    expect(controller.values.value.stateRegistration).toBe(nova)
  })

  it('propaga a IE do formulário para a matriz ao salvar', async () => {
    const { controller, updateCompany, updateEstablishment } = build()
    const nova = '004684530.00-99'

    await controller.loadCompany()

    updateCompany.execute.mockResolvedValue(Either.right(company()))
    updateEstablishment.execute.mockResolvedValue(Either.right(matriz(nova)))

    await controller.save({
      company: { ...controller.values.value, stateRegistration: nova },
      sede: controller.sede.value,
    })

    expect(updateEstablishment.execute).toHaveBeenCalledWith(
      'estab-1',
      expect.objectContaining({ inscricaoEstadual: nova }),
    )
  })
})
