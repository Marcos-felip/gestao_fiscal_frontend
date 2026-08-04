import type { FiscalDocumentStatus } from '@/enums/fiscal-document-status.enum'

/** Transição de status de um documento fiscal (de → para, com motivo). */
export class FiscalStatusHistory {
  readonly id: string
  readonly fiscalDocumentId: string
  readonly statusFrom: FiscalDocumentStatus
  readonly statusTo: FiscalDocumentStatus
  readonly motivo: string | null
  readonly usuarioId: string | null
  readonly createdAt: Date

  constructor(fields: {
    id: string
    fiscalDocumentId: string
    statusFrom: FiscalDocumentStatus
    statusTo: FiscalDocumentStatus
    motivo: string | null
    usuarioId: string | null
    createdAt: Date
  }) {
    this.id = fields.id
    this.fiscalDocumentId = fields.fiscalDocumentId
    this.statusFrom = fields.statusFrom
    this.statusTo = fields.statusTo
    this.motivo = fields.motivo
    this.usuarioId = fields.usuarioId
    this.createdAt = fields.createdAt
  }
}
