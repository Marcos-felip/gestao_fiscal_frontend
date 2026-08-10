/**
 * Meio de pagamento simbólico (tPag) usado na emissão fiscal. O backend traduz
 * cada código para o valor numérico exigido pela SEFAZ.
 */
export const FiscalPaymentCode = {
  DINHEIRO: 'DINHEIRO',
  CHEQUE: 'CHEQUE',
  CARTAO_CREDITO: 'CARTAO_CREDITO',
  CARTAO_DEBITO: 'CARTAO_DEBITO',
  CREDITO_LOJA: 'CREDITO_LOJA',
  VALE_ALIMENTACAO: 'VALE_ALIMENTACAO',
  VALE_REFEICAO: 'VALE_REFEICAO',
  VALE_PRESENTE: 'VALE_PRESENTE',
  VALE_COMBUSTIVEL: 'VALE_COMBUSTIVEL',
  BOLETO: 'BOLETO',
  PIX: 'PIX',
  SEM_PAGAMENTO: 'SEM_PAGAMENTO',
  OUTRO: 'OUTRO',
} as const

export type FiscalPaymentCode =
  (typeof FiscalPaymentCode)[keyof typeof FiscalPaymentCode]

export const fiscalPaymentCodeLabels: Record<FiscalPaymentCode, string> = {
  DINHEIRO: 'Dinheiro',
  CHEQUE: 'Cheque',
  CARTAO_CREDITO: 'Cartão de crédito',
  CARTAO_DEBITO: 'Cartão de débito',
  CREDITO_LOJA: 'Crédito loja',
  VALE_ALIMENTACAO: 'Vale-alimentação',
  VALE_REFEICAO: 'Vale-refeição',
  VALE_PRESENTE: 'Vale-presente',
  VALE_COMBUSTIVEL: 'Vale-combustível',
  BOLETO: 'Boleto',
  PIX: 'PIX',
  SEM_PAGAMENTO: 'Sem pagamento',
  OUTRO: 'Outro',
}

export const fiscalPaymentCodeOptions: {
  value: FiscalPaymentCode
  label: string
}[] = [
  {
    value: FiscalPaymentCode.DINHEIRO,
    label: fiscalPaymentCodeLabels.DINHEIRO,
  },
  { value: FiscalPaymentCode.CHEQUE, label: fiscalPaymentCodeLabels.CHEQUE },
  {
    value: FiscalPaymentCode.CARTAO_CREDITO,
    label: fiscalPaymentCodeLabels.CARTAO_CREDITO,
  },
  {
    value: FiscalPaymentCode.CARTAO_DEBITO,
    label: fiscalPaymentCodeLabels.CARTAO_DEBITO,
  },
  {
    value: FiscalPaymentCode.CREDITO_LOJA,
    label: fiscalPaymentCodeLabels.CREDITO_LOJA,
  },
  {
    value: FiscalPaymentCode.VALE_ALIMENTACAO,
    label: fiscalPaymentCodeLabels.VALE_ALIMENTACAO,
  },
  {
    value: FiscalPaymentCode.VALE_REFEICAO,
    label: fiscalPaymentCodeLabels.VALE_REFEICAO,
  },
  {
    value: FiscalPaymentCode.VALE_PRESENTE,
    label: fiscalPaymentCodeLabels.VALE_PRESENTE,
  },
  {
    value: FiscalPaymentCode.VALE_COMBUSTIVEL,
    label: fiscalPaymentCodeLabels.VALE_COMBUSTIVEL,
  },
  { value: FiscalPaymentCode.BOLETO, label: fiscalPaymentCodeLabels.BOLETO },
  { value: FiscalPaymentCode.PIX, label: fiscalPaymentCodeLabels.PIX },
  {
    value: FiscalPaymentCode.SEM_PAGAMENTO,
    label: fiscalPaymentCodeLabels.SEM_PAGAMENTO,
  },
  { value: FiscalPaymentCode.OUTRO, label: fiscalPaymentCodeLabels.OUTRO },
]
