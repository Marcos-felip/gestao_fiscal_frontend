import type { CompanyType } from '@/enums/company-type.enum'
import type { TaxRegime } from '@/enums/tax-regime.enum'
import type { TaxRegimeCode } from '@/enums/tax-regime-code.enum'

export class UpdateCompanyDto {
  name?: string
  type?: CompanyType
  cnpj?: string
  stateRegistration?: string
  phone?: string
  taxRegime?: TaxRegime
  // Dados fiscais do emitente (NFC-e).
  razaoSocial?: string
  nomeFantasia?: string
  inscricaoEstadual?: string
  inscricaoMunicipal?: string
  crt?: TaxRegimeCode
  contribuinteIcms?: boolean
  codigoIbgeMunicipio?: string
  telefoneFiscal?: string
  emailFiscal?: string

  constructor(fields: {
    name?: string
    type?: CompanyType
    cnpj?: string
    stateRegistration?: string
    phone?: string
    taxRegime?: TaxRegime
    razaoSocial?: string
    nomeFantasia?: string
    inscricaoEstadual?: string
    inscricaoMunicipal?: string
    crt?: TaxRegimeCode
    contribuinteIcms?: boolean
    codigoIbgeMunicipio?: string
    telefoneFiscal?: string
    emailFiscal?: string
  }) {
    this.name = fields.name
    this.type = fields.type
    this.cnpj = fields.cnpj
    this.stateRegistration = fields.stateRegistration
    this.phone = fields.phone
    this.taxRegime = fields.taxRegime
    this.razaoSocial = fields.razaoSocial
    this.nomeFantasia = fields.nomeFantasia
    this.inscricaoEstadual = fields.inscricaoEstadual
    this.inscricaoMunicipal = fields.inscricaoMunicipal
    this.crt = fields.crt
    this.contribuinteIcms = fields.contribuinteIcms
    this.codigoIbgeMunicipio = fields.codigoIbgeMunicipio
    this.telefoneFiscal = fields.telefoneFiscal
    this.emailFiscal = fields.emailFiscal
  }
}
