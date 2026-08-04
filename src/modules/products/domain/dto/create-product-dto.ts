import type { UnitOfMeasure } from '@/enums/unit-of-measure.enum'
import type { TechnicalAttributes } from '@/modules/products/domain/entities/product.entity'

export class CreateProductDto {
  name: string
  description?: string
  sku?: string
  barcode?: string
  unit?: UnitOfMeasure
  costPrice?: number
  salePrice?: number
  minStock?: number
  ncm?: string
  cest?: string
  cfop?: string
  origin?: number
  csosn?: string
  cstIcms?: string
  cstPis?: string
  cstCofins?: string
  aliquotaIcms?: number
  aliquotaPis?: number
  aliquotaCofins?: number
  technicalAttributes?: TechnicalAttributes

  constructor(fields: {
    name: string
    description?: string
    sku?: string
    barcode?: string
    unit?: UnitOfMeasure
    costPrice?: number
    salePrice?: number
    minStock?: number
    ncm?: string
    cest?: string
    cfop?: string
    origin?: number
    csosn?: string
    cstIcms?: string
    cstPis?: string
    cstCofins?: string
    aliquotaIcms?: number
    aliquotaPis?: number
    aliquotaCofins?: number
    technicalAttributes?: TechnicalAttributes
  }) {
    this.name = fields.name
    this.description = fields.description
    this.sku = fields.sku
    this.barcode = fields.barcode
    this.unit = fields.unit
    this.costPrice = fields.costPrice
    this.salePrice = fields.salePrice
    this.minStock = fields.minStock
    this.ncm = fields.ncm
    this.cest = fields.cest
    this.cfop = fields.cfop
    this.origin = fields.origin
    this.csosn = fields.csosn
    this.cstIcms = fields.cstIcms
    this.cstPis = fields.cstPis
    this.cstCofins = fields.cstCofins
    this.aliquotaIcms = fields.aliquotaIcms
    this.aliquotaPis = fields.aliquotaPis
    this.aliquotaCofins = fields.aliquotaCofins
    this.technicalAttributes = fields.technicalAttributes
  }
}
