import type { CompanyType } from '@/enums/company-type.enum'
import type { TaxRegime } from '@/enums/tax-regime.enum'
import type { TaxRegimeCode } from '@/enums/tax-regime-code.enum'

export class Company {
  readonly id: string
  readonly name: string
  readonly type: CompanyType | null
  readonly cnpj: string | null
  readonly stateRegistration: string | null
  readonly phone: string | null
  readonly taxRegime: TaxRegime | null
  readonly businessSegment: string | null
  readonly isOnboarded: boolean
  readonly razaoSocial: string | null
  readonly nomeFantasia: string | null
  readonly inscricaoEstadual: string | null
  readonly inscricaoMunicipal: string | null
  readonly crt: TaxRegimeCode | null
  readonly contribuinteIcms: boolean
  readonly codigoIbgeMunicipio: string | null
  readonly telefoneFiscal: string | null
  readonly emailFiscal: string | null
  readonly fiscalConfigComplete: boolean
  readonly createdAt: string | null
  readonly updatedAt: string | null

  constructor(
    id: string,
    name: string,
    type: CompanyType | null,
    cnpj: string | null,
    stateRegistration: string | null,
    phone: string | null,
    taxRegime: TaxRegime | null,
    businessSegment: string | null,
    isOnboarded: boolean,
    razaoSocial: string | null,
    nomeFantasia: string | null,
    inscricaoEstadual: string | null,
    inscricaoMunicipal: string | null,
    crt: TaxRegimeCode | null,
    contribuinteIcms: boolean,
    codigoIbgeMunicipio: string | null,
    telefoneFiscal: string | null,
    emailFiscal: string | null,
    fiscalConfigComplete: boolean,
    createdAt: string | null,
    updatedAt: string | null,
  ) {
    this.id = id
    this.name = name
    this.type = type
    this.cnpj = cnpj
    this.stateRegistration = stateRegistration
    this.phone = phone
    this.taxRegime = taxRegime
    this.businessSegment = businessSegment
    this.isOnboarded = isOnboarded
    this.razaoSocial = razaoSocial
    this.nomeFantasia = nomeFantasia
    this.inscricaoEstadual = inscricaoEstadual
    this.inscricaoMunicipal = inscricaoMunicipal
    this.crt = crt
    this.contribuinteIcms = contribuinteIcms
    this.codigoIbgeMunicipio = codigoIbgeMunicipio
    this.telefoneFiscal = telefoneFiscal
    this.emailFiscal = emailFiscal
    this.fiscalConfigComplete = fiscalConfigComplete
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  /** Empresa que já concluiu o onboarding (CNPJ/regime/matriz definidos). */
  get isConfigured(): boolean {
    return this.isOnboarded
  }
}
