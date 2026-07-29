import type { Purchase } from '@/modules/purchases/domain/entities/purchase.entity'

export interface PurchaseList {
  items: Purchase[]
  total: number
  page: number
  limit: number
}
