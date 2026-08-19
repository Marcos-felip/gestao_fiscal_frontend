import type { FiscalDocument } from '@/modules/fiscal/domain/entities/fiscal-document.entity'

export interface FiscalDocumentListResponse {
  items: FiscalDocument[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
}
