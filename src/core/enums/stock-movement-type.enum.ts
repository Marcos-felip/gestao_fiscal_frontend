export const StockMovementType = {
  ENTRADA: 'ENTRADA',
  SAIDA: 'SAIDA',
  AJUSTE: 'AJUSTE',
} as const

export type StockMovementType =
  (typeof StockMovementType)[keyof typeof StockMovementType]

export const stockMovementTypeLabels: Record<StockMovementType, string> = {
  ENTRADA: 'Entrada',
  SAIDA: 'Saída',
  AJUSTE: 'Ajuste',
}

export const stockMovementTypeOptions: {
  value: StockMovementType
  label: string
}[] = [
  { value: StockMovementType.ENTRADA, label: stockMovementTypeLabels.ENTRADA },
  { value: StockMovementType.SAIDA, label: stockMovementTypeLabels.SAIDA },
  { value: StockMovementType.AJUSTE, label: stockMovementTypeLabels.AJUSTE },
]
