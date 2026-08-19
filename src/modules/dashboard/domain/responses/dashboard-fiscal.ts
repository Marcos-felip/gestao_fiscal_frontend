export interface CertificateAlert {
  establishmentId: string
  establishmentName: string
  expiresAt: string
  daysToExpire: number
  expired: boolean
}

export interface FiscalMonthCounts {
  total: number
  authorized: number
  rejected: number
  cancelled: number
  pending: number
  contingency: number
  failed: number
}

export interface DashboardFiscal {
  month: FiscalMonthCounts
  authorizedTotal: number
  /** Só os certificados que vencem em até 30 dias, do mais urgente ao menos. */
  certificateAlerts: CertificateAlert[]
}
