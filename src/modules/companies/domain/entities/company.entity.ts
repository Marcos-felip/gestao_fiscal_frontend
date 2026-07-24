import type { CompanyType } from '@/enums/company-type.enum'
import type { TaxRegime } from '@/enums/tax-regime.enum'

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
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  /** Empresa que já concluiu o onboarding (CNPJ/regime/matriz definidos). */
  get isConfigured(): boolean {
    return this.isOnboarded
  }
}
