export class ListProductsDto {
  page: number
  limit: number
  search?: string

  constructor(fields: { page: number; limit: number; search?: string }) {
    this.page = fields.page
    this.limit = fields.limit
    this.search = fields.search
  }
}
