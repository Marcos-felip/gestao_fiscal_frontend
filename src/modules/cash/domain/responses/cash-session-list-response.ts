import type { CashSession } from '@/modules/cash/domain/entities/cash-session.entity'

/** Página do histórico de sessões de caixa. */
export interface CashSessionList {
  items: CashSession[]
  total: number
  page: number
  limit: number
}
