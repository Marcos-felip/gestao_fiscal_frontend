import type { NfeImport } from '@/modules/nfe-import/domain/entities/nfe-import.entity'

export interface NfeImportList {
  items: NfeImport[]
  total: number
  page: number
  limit: number
}
