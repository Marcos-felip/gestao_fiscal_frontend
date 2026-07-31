export class CreatePayableDto {
  description: string
  totalAmount: number
  dueDate: string
  supplierId?: string
  installments?: number
  intervalDays?: number
  category?: string

  constructor(fields: {
    description: string
    totalAmount: number
    dueDate: string
    supplierId?: string
    installments?: number
    intervalDays?: number
    category?: string
  }) {
    this.description = fields.description
    this.totalAmount = fields.totalAmount
    this.dueDate = fields.dueDate
    this.supplierId = fields.supplierId
    this.installments = fields.installments
    this.intervalDays = fields.intervalDays
    this.category = fields.category
  }
}
