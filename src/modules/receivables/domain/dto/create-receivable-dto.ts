export class CreateReceivableDto {
  description: string
  totalAmount: number
  dueDate: string
  customerId?: string
  installments?: number
  intervalDays?: number
  category?: string

  constructor(fields: {
    description: string
    totalAmount: number
    dueDate: string
    customerId?: string
    installments?: number
    intervalDays?: number
    category?: string
  }) {
    this.description = fields.description
    this.totalAmount = fields.totalAmount
    this.dueDate = fields.dueDate
    this.customerId = fields.customerId
    this.installments = fields.installments
    this.intervalDays = fields.intervalDays
    this.category = fields.category
  }
}
