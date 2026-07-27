import type { CompanyType } from '@/enums/company-type.enum'
import type { TaxRegime } from '@/enums/tax-regime.enum'

export class UpdateCompanyDto {
  name?: string
  type?: CompanyType
  cnpj?: string
  stateRegistration?: string
  phone?: string
  taxRegime?: TaxRegime

  constructor(fields: {
    name?: string
    type?: CompanyType
    cnpj?: string
    stateRegistration?: string
    phone?: string
    taxRegime?: TaxRegime
  }) {
    this.name = fields.name
    this.type = fields.type
    this.cnpj = fields.cnpj
    this.stateRegistration = fields.stateRegistration
    this.phone = fields.phone
    this.taxRegime = fields.taxRegime
  }
}
