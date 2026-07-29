import type { CompanyType } from '@/enums/company-type.enum'

export class CreateCompanyDto {
  name: string
  type?: CompanyType
  businessSegment?: string
  phone?: string

  constructor(fields: {
    name: string
    type?: CompanyType
    businessSegment?: string
    phone?: string
  }) {
    this.name = fields.name
    this.type = fields.type
    this.businessSegment = fields.businessSegment
    this.phone = fields.phone
  }
}
