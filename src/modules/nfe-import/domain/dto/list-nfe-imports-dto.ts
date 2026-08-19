export class ListNfeImportsDto {
  page: number
  limit: number

  constructor(fields: { page: number; limit: number }) {
    this.page = fields.page
    this.limit = fields.limit
  }
}
