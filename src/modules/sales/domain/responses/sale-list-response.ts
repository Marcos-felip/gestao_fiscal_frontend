import type { Sale } from '@/modules/sales/domain/entities/sale.entity'

export interface SaleList {
  items: Sale[]
  total: number
  page: number
  limit: number
}
