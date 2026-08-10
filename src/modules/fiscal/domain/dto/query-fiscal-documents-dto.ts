import type { FiscalDocumentStatus } from '@/core/enums/fiscal-document-status.enum'
import type { FiscalDocumentModel } from '@/core/enums/fiscal-document-model.enum'

/** Filtros da listagem paginada de documentos fiscais (`GET /fiscal/documents`). */
export class QueryFiscalDocumentsDto {
  page?: number
  limit?: number
  status?: FiscalDocumentStatus
  modelo?: FiscalDocumentModel
  saleId?: string
  establishmentId?: string
  startDate?: string
  endDate?: string

  constructor(fields: {
    page?: number
    limit?: number
    status?: FiscalDocumentStatus
    modelo?: FiscalDocumentModel
    saleId?: string
    establishmentId?: string
    startDate?: string
    endDate?: string
  }) {
    this.page = fields.page
    this.limit = fields.limit
    this.status = fields.status
    this.modelo = fields.modelo
    this.saleId = fields.saleId
    this.establishmentId = fields.establishmentId
    this.startDate = fields.startDate
    this.endDate = fields.endDate
  }
}
