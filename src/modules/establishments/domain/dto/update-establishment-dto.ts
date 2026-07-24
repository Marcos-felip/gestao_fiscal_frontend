import type { EstablishmentType } from '@/enums/establishment-type.enum'

/**
 * Dados para atualizar um estabelecimento (`PATCH /establishments/:id`).
 * Todos os campos são opcionais — apenas os informados são enviados.
 */
export class UpdateEstablishmentDto {
  name?: string
  type?: EstablishmentType
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
    name?: string
    type?: EstablishmentType
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
