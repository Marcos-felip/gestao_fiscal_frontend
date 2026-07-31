import type { Payable } from '@/modules/payables/domain/entities/payable.entity'

export interface PayableList {
  items: Payable[]
  total: number
  page: number
  limit: number
}
