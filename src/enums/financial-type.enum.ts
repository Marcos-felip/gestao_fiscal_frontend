export const FinancialType = {
  RECEBER: 'RECEBER',
  PAGAR: 'PAGAR',
} as const

export type FinancialType = (typeof FinancialType)[keyof typeof FinancialType]

export const financialTypeLabels: Record<FinancialType, string> = {
  RECEBER: 'A receber',
  PAGAR: 'A pagar',
}
