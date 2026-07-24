import type { EstablishmentType } from '@/enums/establishment-type.enum'

export class Establishment {
  readonly id: string
  readonly name: string
  readonly type: EstablishmentType
  readonly cnpj: string | null
  readonly inscricaoEstadual: string | null
  readonly inscricaoMunicipal: string | null
  readonly cep: string | null
  readonly street: string | null
  readonly number: string | null
  readonly complement: string | null
  readonly neighborhood: string | null
  readonly city: string | null
  readonly state: string | null
  readonly createdAt: string | null

  constructor(
    id: string,
    name: string,
    type: EstablishmentType,
    cnpj: string | null,
    inscricaoEstadual: string | null,
    inscricaoMunicipal: string | null,
    cep: string | null,
    street: string | null,
    number: string | null,
    complement: string | null,
    neighborhood: string | null,
    city: string | null,
    state: string | null,
    createdAt: string | null,
  ) {
    this.id = id
    this.name = name
    this.type = type
    this.cnpj = cnpj
    this.inscricaoEstadual = inscricaoEstadual
    this.inscricaoMunicipal = inscricaoMunicipal
    this.cep = cep
    this.street = street
    this.number = number
    this.complement = complement
    this.neighborhood = neighborhood
    this.city = city
    this.state = state
    this.createdAt = createdAt
  }

  /** Matriz não pode ser excluída (regra de negócio do backend). */
  get isMatriz(): boolean {
    return this.type === 'MATRIZ'
  }

  /** Cidade/UF formatada para exibição (ex.: "São Paulo/SP"). */
  get location(): string {
    return [this.city, this.state].filter(Boolean).join('/')
  }
}
