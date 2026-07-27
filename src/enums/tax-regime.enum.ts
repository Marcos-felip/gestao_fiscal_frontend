export const TaxRegime = {
  SIMPLES_NACIONAL: 'SIMPLES_NACIONAL',
  LUCRO_PRESUMIDO: 'LUCRO_PRESUMIDO',
  LUCRO_REAL: 'LUCRO_REAL',
  MEI: 'MEI',
} as const

export type TaxRegime = (typeof TaxRegime)[keyof typeof TaxRegime]

export const taxRegimeOptions: { value: TaxRegime; label: string }[] = [
  { value: TaxRegime.SIMPLES_NACIONAL, label: 'Simples Nacional' },
  { value: TaxRegime.LUCRO_PRESUMIDO, label: 'Lucro Presumido' },
  { value: TaxRegime.LUCRO_REAL, label: 'Lucro Real' },
  { value: TaxRegime.MEI, label: 'MEI' },
]
