/**
 * Indicador de inscrição estadual do destinatário na NF-e (`indIEDest`).
 *
 * **Não se deduz do tipo de pessoa.** Prestadora de serviço é pessoa jurídica e
 * **não** é contribuinte de ICMS; produtor rural pode ser pessoa física e ser
 * contribuinte. Quem declara é quem cadastra o parceiro — e é por isso que o
 * campo não tem valor padrão nem no cadastro nem no formulário.
 *
 * Espelha `IND_IE_DEST` em
 * `gestao_fiscal_backend/src/fiscal/fiscal-engine/fiscal-engine.interface.ts`.
 */
export const IndIeDest = {
  /** Contribuinte de ICMS — **exige** inscrição estadual. */
  CONTRIBUINTE: 1,
  /** Contribuinte isento de inscrição no cadastro de contribuintes. */
  ISENTO: 2,
  /** Não contribuinte, com ou sem inscrição em outra atividade. */
  NAO_CONTRIBUINTE: 9,
} as const

export type IndIeDest = (typeof IndIeDest)[keyof typeof IndIeDest]

export const IND_IE_DEST_VALORES = [
  IndIeDest.CONTRIBUINTE,
  IndIeDest.ISENTO,
  IndIeDest.NAO_CONTRIBUINTE,
] as const

interface IndIeDestOption {
  value: IndIeDest
  label: string
  /** Explica a escolha para quem não é contador. */
  description: string
}

export const indIeDestOptions: IndIeDestOption[] = [
  {
    value: IndIeDest.CONTRIBUINTE,
    label: 'Contribuinte de ICMS',
    description:
      'Tem inscrição estadual. Comércio e indústria em geral. Exige a inscrição preenchida.',
  },
  {
    value: IndIeDest.ISENTO,
    label: 'Isento de inscrição estadual',
    description:
      'Contribuinte dispensado de se inscrever no cadastro do estado.',
  },
  {
    value: IndIeDest.NAO_CONTRIBUINTE,
    label: 'Não contribuinte',
    description:
      'Não recolhe ICMS: prestadoras de serviço, clínicas, escritórios, órgãos públicos.',
  },
]

/** Só o contribuinte precisa — e só ele pode — informar inscrição estadual. */
export function exigeInscricaoEstadual(indicador: IndIeDest | null): boolean {
  return indicador === IndIeDest.CONTRIBUINTE
}

export function indIeDestLabel(indicador: IndIeDest | null): string {
  if (indicador === null) return 'Não informado'

  return (
    indIeDestOptions.find((opcao) => opcao.value === indicador)?.label ??
    'Não informado'
  )
}
