/**
 * Terminal/caixa cadastrado de um estabelecimento. É onde as sessões (abrir e
 * fechar caixa) acontecem. O nome é único por estabelecimento.
 */
export class CashRegister {
  readonly id: string
  readonly establishmentId: string | null
  readonly establishmentName: string | null
  readonly name: string
  readonly isActive: boolean
  readonly createdAt: string | null
  readonly updatedAt: string | null

  constructor(fields: {
    id: string
    establishmentId: string | null
    establishmentName: string | null
    name: string
    isActive: boolean
    createdAt: string | null
    updatedAt: string | null
  }) {
    this.id = fields.id
    this.establishmentId = fields.establishmentId
    this.establishmentName = fields.establishmentName
    this.name = fields.name
    this.isActive = fields.isActive
    this.createdAt = fields.createdAt
    this.updatedAt = fields.updatedAt
  }
}
