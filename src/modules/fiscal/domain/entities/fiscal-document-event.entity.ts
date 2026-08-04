/**
 * Evento técnico registrado durante o ciclo de vida do documento fiscal
 * (envio, retorno da SEFAZ, cancelamento). `detalhes` é um Json livre.
 */
export class FiscalDocumentEvent {
  readonly id: string
  readonly fiscalDocumentId: string
  readonly tipo: string
  readonly detalhes: unknown | null
  readonly usuarioId: string | null
  readonly createdAt: Date

  constructor(fields: {
    id: string
    fiscalDocumentId: string
    tipo: string
    detalhes: unknown | null
    usuarioId: string | null
    createdAt: Date
  }) {
    this.id = fields.id
    this.fiscalDocumentId = fields.fiscalDocumentId
    this.tipo = fields.tipo
    this.detalhes = fields.detalhes
    this.usuarioId = fields.usuarioId
    this.createdAt = fields.createdAt
  }
}
