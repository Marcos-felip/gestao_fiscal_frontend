import type { Partner } from '@/modules/partners/domain/entities/partner.entity'

export interface PartnerList {
  items: Partner[]
  total: number
  page: number
  limit: number
}
