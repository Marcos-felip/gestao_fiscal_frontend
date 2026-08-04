export const FiscalEnvironment = {
  HOMOLOGACAO: 'HOMOLOGACAO',
  PRODUCAO: 'PRODUCAO',
} as const

export type FiscalEnvironment =
  (typeof FiscalEnvironment)[keyof typeof FiscalEnvironment]

export const fiscalEnvironmentLabels: Record<FiscalEnvironment, string> = {
  HOMOLOGACAO: 'Homologação',
  PRODUCAO: 'Produção',
}

export const fiscalEnvironmentOptions: {
  value: FiscalEnvironment
  label: string
}[] = [
  {
    value: FiscalEnvironment.HOMOLOGACAO,
    label: fiscalEnvironmentLabels.HOMOLOGACAO,
  },
  {
    value: FiscalEnvironment.PRODUCAO,
    label: fiscalEnvironmentLabels.PRODUCAO,
  },
]
