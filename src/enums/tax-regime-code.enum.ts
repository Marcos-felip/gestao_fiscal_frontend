/**
 * Código de Regime Tributário (CRT) usado na emissão fiscal. Diferente do
 * `TaxRegime` cadastral: aqui são os códigos aceitos pela SEFAZ.
 */
export const TaxRegimeCode = {
  SIMPLES_NACIONAL: 'SIMPLES_NACIONAL',
  SIMPLES_EXCESSO: 'SIMPLES_EXCESSO',
  REGIME_NORMAL: 'REGIME_NORMAL',
} as const

export type TaxRegimeCode = (typeof TaxRegimeCode)[keyof typeof TaxRegimeCode]

export const taxRegimeCodeLabels: Record<TaxRegimeCode, string> = {
  SIMPLES_NACIONAL: 'Simples Nacional',
  SIMPLES_EXCESSO: 'Simples Nacional - excesso de sublimite',
  REGIME_NORMAL: 'Regime Normal',
}

export const taxRegimeCodeOptions: { value: TaxRegimeCode; label: string }[] = [
  {
    value: TaxRegimeCode.SIMPLES_NACIONAL,
    label: taxRegimeCodeLabels.SIMPLES_NACIONAL,
  },
  {
    value: TaxRegimeCode.SIMPLES_EXCESSO,
    label: taxRegimeCodeLabels.SIMPLES_EXCESSO,
  },
  {
    value: TaxRegimeCode.REGIME_NORMAL,
    label: taxRegimeCodeLabels.REGIME_NORMAL,
  },
]
