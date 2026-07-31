import type { Receivable } from '@/modules/receivables/domain/entities/receivable.entity'

export interface ReceivableList {
  items: Receivable[]
  total: number
  page: number
  limit: number
}
