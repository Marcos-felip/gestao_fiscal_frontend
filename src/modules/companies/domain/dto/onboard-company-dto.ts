import type { TaxRegime } from '@/enums/tax-regime.enum'

export class OnboardCompanyDto {
  cnpj: string
  taxRegime: TaxRegime
  establishmentName: string
  phone?: string
  inscricaoEstadual?: string
  inscricaoMunicipal?: string
  cep?: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string

  constructor(fields: {
    cnpj: string
    taxRegime: TaxRegime
    establishmentName: string
    phone?: string
    inscricaoEstadual?: string
    inscricaoMunicipal?: string
    cep?: string
    street?: string
    number?: string
    complement?: string
    neighborhood?: string
    city?: string
    state?: string
  }) {
    this.cnpj = fields.cnpj
    this.taxRegime = fields.taxRegime
    this.establishmentName = fields.establishmentName
    this.phone = fields.phone
    this.inscricaoEstadual = fields.inscricaoEstadual
    this.inscricaoMunicipal = fields.inscricaoMunicipal
    this.cep = fields.cep
    this.street = fields.street
    this.number = fields.number
    this.complement = fields.complement
    this.neighborhood = fields.neighborhood
    this.city = fields.city
    this.state = fields.state
  }
}
