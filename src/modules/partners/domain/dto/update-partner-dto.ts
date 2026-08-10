import type { PartnerType } from '@/core/enums/partner-type.enum'
import type { PersonType } from '@/core/enums/person-type.enum'

export class UpdatePartnerDto {
  type?: PartnerType
  personType?: PersonType
  name?: string
  tradeName?: string
  cpfCnpj?: string
  rgIe?: string
  email?: string
  phone?: string
  cep?: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  isActive?: boolean

  constructor(fields: {
    type?: PartnerType
    personType?: PersonType
    name?: string
    tradeName?: string
    cpfCnpj?: string
    rgIe?: string
    email?: string
    phone?: string
    cep?: string
    street?: string
    number?: string
    complement?: string
    neighborhood?: string
    city?: string
    state?: string
    isActive?: boolean
  }) {
    this.type = fields.type
    this.personType = fields.personType
    this.name = fields.name
    this.tradeName = fields.tradeName
    this.cpfCnpj = fields.cpfCnpj
    this.rgIe = fields.rgIe
    this.email = fields.email
    this.phone = fields.phone
    this.cep = fields.cep
    this.street = fields.street
    this.number = fields.number
    this.complement = fields.complement
    this.neighborhood = fields.neighborhood
    this.city = fields.city
    this.state = fields.state
    this.isActive = fields.isActive
  }
}
