import type { UnitOfMeasure } from '@/enums/unit-of-measure.enum'

export interface SaleContextRef {
  id: string
  name: string
}

export interface SaleContextProduct {
  id: string
  name: string
  sku: string | null
  barcode: string | null
  unit: UnitOfMeasure | null
  salePrice: number | null
  currentStock: number
}

/**
 * Catálogo mínimo para montar uma venda no balcão, servido por
 * `GET /sales/context` (gated em `sales.create`) — assim o vendedor não precisa
 * de `establishments.list`/`partners.list` e esses módulos seguem escondidos.
 */
export interface SaleContext {
  establishments: SaleContextRef[]
  customers: SaleContextRef[]
  products: SaleContextProduct[]
}
