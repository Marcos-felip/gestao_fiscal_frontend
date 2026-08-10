import type { PartnerType } from '@/core/enums/partner-type.enum'

export class ListPartnersDto {
  page: number
  limit: number
  search?: string
  type?: PartnerType

  constructor(fields: {
    page: number
    limit: number
    search?: string
    type?: PartnerType
  }) {
    this.page = fields.page
    this.limit = fields.limit
    this.search = fields.search
    this.type = fields.type
  }
}
