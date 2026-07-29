export interface CreatePurchaseItemInput {
  productId: string
  quantity: number
  unitPrice: number
}

export class CreatePurchaseDto {
  establishmentId: string
  items: CreatePurchaseItemInput[]
  supplierId?: string
  notes?: string
  purchaseDate?: string

  constructor(fields: {
    establishmentId: string
    items: CreatePurchaseItemInput[]
    supplierId?: string
    notes?: string
    purchaseDate?: string
  }) {
    this.establishmentId = fields.establishmentId
    this.items = fields.items
    this.supplierId = fields.supplierId
    this.notes = fields.notes
    this.purchaseDate = fields.purchaseDate
  }
}
