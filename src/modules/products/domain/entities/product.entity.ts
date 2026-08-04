import type { UnitOfMeasure } from '@/enums/unit-of-measure.enum'

/** Atributos técnicos livres (chave → valor) armazenados como JSON. */
export type TechnicalAttributes = Record<string, unknown>

export class Product {
  readonly id: string
  readonly companyId: string
  readonly name: string
  readonly description: string | null
  readonly sku: string | null
  readonly barcode: string | null
  readonly unit: UnitOfMeasure
  readonly costPrice: number | null
  readonly salePrice: number | null
  readonly currentStock: number
  readonly minStock: number | null
  readonly isActive: boolean
  readonly ncm: string | null
  readonly cest: string | null
  readonly cfop: string | null
  readonly origin: number | null
  readonly csosn: string | null
  readonly cstIcms: string | null
  readonly cstPis: string | null
  readonly cstCofins: string | null
  readonly aliquotaIcms: number | null
  readonly aliquotaPis: number | null
  readonly aliquotaCofins: number | null
  /** Derivado no backend: indica se o produto tem dados fiscais completos. */
  readonly fiscalComplete: boolean
  readonly technicalAttributes: TechnicalAttributes | null
  readonly createdAt: string | null
  readonly updatedAt: string | null

  constructor(
    id: string,
    companyId: string,
    name: string,
    description: string | null,
    sku: string | null,
    barcode: string | null,
    unit: UnitOfMeasure,
    costPrice: number | null,
    salePrice: number | null,
    currentStock: number,
    minStock: number | null,
    isActive: boolean,
    ncm: string | null,
    cest: string | null,
    cfop: string | null,
    origin: number | null,
    csosn: string | null,
    cstIcms: string | null,
    cstPis: string | null,
    cstCofins: string | null,
    aliquotaIcms: number | null,
    aliquotaPis: number | null,
    aliquotaCofins: number | null,
    fiscalComplete: boolean,
    technicalAttributes: TechnicalAttributes | null,
    createdAt: string | null,
    updatedAt: string | null,
  ) {
    this.id = id
    this.companyId = companyId
    this.name = name
    this.description = description
    this.sku = sku
    this.barcode = barcode
    this.unit = unit
    this.costPrice = costPrice
    this.salePrice = salePrice
    this.currentStock = currentStock
    this.minStock = minStock
    this.isActive = isActive
    this.ncm = ncm
    this.cest = cest
    this.cfop = cfop
    this.origin = origin
    this.csosn = csosn
    this.cstIcms = cstIcms
    this.cstPis = cstPis
    this.cstCofins = cstCofins
    this.aliquotaIcms = aliquotaIcms
    this.aliquotaPis = aliquotaPis
    this.aliquotaCofins = aliquotaCofins
    this.fiscalComplete = fiscalComplete
    this.technicalAttributes = technicalAttributes
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  /** Estoque no ou abaixo do mínimo configurado (quando há mínimo). */
  get isLowStock(): boolean {
    return this.minStock !== null && this.currentStock <= this.minStock
  }

  /** Produto sem dados fiscais completos para emissão. */
  get isFiscalPending(): boolean {
    return !this.fiscalComplete
  }
}
