export class FiscalSettingsEvent {
  readonly id: string
  readonly companyId: string
  readonly fiscalSettingsId: string
  readonly tipo: string
  readonly valorAnterior: string | null
  readonly valorNovo: string | null
  readonly usuarioId: string | null
  readonly createdAt: Date

  constructor(fields: {
    id: string
    companyId: string
    fiscalSettingsId: string
    tipo: string
    valorAnterior: string | null
    valorNovo: string | null
    usuarioId: string | null
    createdAt: Date
  }) {
    this.id = fields.id
    this.companyId = fields.companyId
    this.fiscalSettingsId = fields.fiscalSettingsId
    this.tipo = fields.tipo
    this.valorAnterior = fields.valorAnterior
    this.valorNovo = fields.valorNovo
    this.usuarioId = fields.usuarioId
    this.createdAt = fields.createdAt
  }
}
