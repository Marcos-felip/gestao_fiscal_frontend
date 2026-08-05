import type { FiscalDocument } from '@/modules/fiscal/domain/entities/fiscal-document.entity'

export interface FiscalRejectionUltimaTentativa {
  data: string
  usuarioId: string | null
  motivo: string | null
}

export interface FiscalRejectionItem {
  document: FiscalDocument
  reprocessavel: boolean
  ultimaTentativa: FiscalRejectionUltimaTentativa | null
}

export interface FiscalRejectionListResponse {
  items: FiscalRejectionItem[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
}
