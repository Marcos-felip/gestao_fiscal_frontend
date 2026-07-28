import type { Product } from '@/modules/products/domain/entities/product.entity'

export interface ProductList {
  items: Product[]
  total: number
  page: number
  limit: number
}
