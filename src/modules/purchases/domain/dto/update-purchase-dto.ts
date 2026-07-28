export class UpdatePurchaseDto {
  supplierId?: string
  notes?: string
  purchaseDate?: string

  constructor(fields: {
    supplierId?: string
    notes?: string
    purchaseDate?: string
  }) {
    this.supplierId = fields.supplierId
    this.notes = fields.notes
    this.purchaseDate = fields.purchaseDate
  }
}
