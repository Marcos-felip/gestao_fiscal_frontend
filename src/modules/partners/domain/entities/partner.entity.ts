import type { PartnerType } from '@/core/enums/partner-type.enum'
import type { PersonType } from '@/core/enums/person-type.enum'
import type { IndIeDest } from '@/core/enums/ind-ie-dest.enum'

export class Partner {
  readonly id: string
  readonly companyId: string
  readonly type: PartnerType
  readonly personType: PersonType
  readonly name: string
  readonly tradeName: string | null
  readonly cpfCnpj: string | null
  readonly rgIe: string | null
  readonly email: string | null
  readonly phone: string | null
  readonly cep: string | null
  readonly street: string | null
  readonly number: string | null
  readonly complement: string | null
  readonly neighborhood: string | null
  readonly city: string | null
  readonly state: string | null
  /** Código IBGE do município (7 dígitos). Exigido para receber NF-e. */
  readonly ibgeCode: string | null
  /**
   * Indicador de IE na NF-e. Nulo enquanto ninguém declarou — e não se deduz do
   * tipo de pessoa: prestadora de serviço é PJ e não é contribuinte de ICMS.
   */
  readonly indIeDest: IndIeDest | null
  readonly isActive: boolean
  readonly createdAt: string | null
  readonly updatedAt: string | null

  constructor(
    id: string,
    companyId: string,
    type: PartnerType,
    personType: PersonType,
    name: string,
    tradeName: string | null,
    cpfCnpj: string | null,
    rgIe: string | null,
    email: string | null,
    phone: string | null,
    cep: string | null,
    street: string | null,
    number: string | null,
    complement: string | null,
    neighborhood: string | null,
    city: string | null,
    state: string | null,
    ibgeCode: string | null,
    indIeDest: IndIeDest | null,
    isActive: boolean,
    createdAt: string | null,
    updatedAt: string | null,
  ) {
    this.id = id
    this.companyId = companyId
    this.type = type
    this.personType = personType
    this.name = name
    this.tradeName = tradeName
    this.cpfCnpj = cpfCnpj
    this.rgIe = rgIe
    this.email = email
    this.phone = phone
    this.cep = cep
    this.street = street
    this.number = number
    this.complement = complement
    this.neighborhood = neighborhood
    this.city = city
    this.state = state
    this.ibgeCode = ibgeCode
    this.indIeDest = indIeDest
    this.isActive = isActive
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  /** Cidade/UF formatada para exibição (ex.: "São Paulo/SP"). */
  get location(): string {
    return [this.city, this.state].filter(Boolean).join('/')
  }
}
