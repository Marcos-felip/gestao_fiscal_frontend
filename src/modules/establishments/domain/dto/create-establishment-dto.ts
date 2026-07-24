import type { EstablishmentType } from '@/enums/establishment-type.enum'

/**
 * Dados para criar um estabelecimento (`POST /establishments`).
 * `name` e `type` são obrigatórios; os demais campos são opcionais.
 */
export class CreateEstablishmentDto {
  name: string
  type: EstablishmentType
  cnpj?: string
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
    name: string
    type: EstablishmentType
    cnpj?: string
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
    this.name = fields.name
    this.type = fields.type
    this.cnpj = fields.cnpj
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
