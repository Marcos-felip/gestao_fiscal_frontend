/** Transportadora da NF-e. Opcional: nem toda venda tem frete. */
export interface EmitNfeTransportadora {
  cpfCnpj: string
  nome: string
  inscricaoEstadual?: string
  endereco?: string
  municipio?: string
  uf?: string
}

export interface EmitNfeVeiculo {
  placa: string
  uf: string
  rntc?: string
}

export interface EmitNfeVolume {
  quantidade?: number
  especie?: string
  marca?: string
  numeracao?: string
  pesoLiquido?: number
  pesoBruto?: number
}

/** Ausente por completo, a nota declara "sem frete" — o caso do balcão. */
export interface EmitNfeTransporte {
  /** 0 remetente · 1 destinatário · 2 terceiros · 3/4 próprio · 9 sem frete */
  modalidade: number
  transportadora?: EmitNfeTransportadora
  veiculo?: EmitNfeVeiculo
  volumes?: EmitNfeVolume[]
}

export interface EmitNfeDuplicata {
  numero: string
  /** ISO `aaaa-MM-dd` */
  vencimento: string
  valor: number
}

export interface EmitNfeCobranca {
  numeroFatura?: string
  valorOriginal?: number
  valorDesconto?: number
  valorLiquido?: number
  duplicatas?: EmitNfeDuplicata[]
}

/**
 * Dados para emitir uma NF-e modelo 55 a partir de uma venda.
 *
 * O destinatário **não** entra aqui: ele vem do cliente da venda, e o backend o
 * monta a partir do cadastro do parceiro. O que o operador informa é o que só
 * ele sabe — o destino da mercadoria, o transporte e a cobrança.
 */
export class EmitNfeDto {
  saleId: string
  /**
   * Venda para consumo do destinatário (`true`) ou para revenda (`false`).
   *
   * Sem valor padrão de propósito: o mesmo produto, para o mesmo cliente, muda
   * conforme o destino da mercadoria.
   */
  consumidorFinal: boolean
  establishmentId?: string
  naturezaOperacao?: string
  presenca?: number
  transporte?: EmitNfeTransporte
  cobranca?: EmitNfeCobranca
  idempotencyKey?: string

  constructor(fields: {
    saleId: string
    consumidorFinal: boolean
    establishmentId?: string
    naturezaOperacao?: string
    presenca?: number
    transporte?: EmitNfeTransporte
    cobranca?: EmitNfeCobranca
    idempotencyKey?: string
  }) {
    this.saleId = fields.saleId
    this.consumidorFinal = fields.consumidorFinal
    this.establishmentId = fields.establishmentId
    this.naturezaOperacao = fields.naturezaOperacao
    this.presenca = fields.presenca
    this.transporte = fields.transporte
    this.cobranca = fields.cobranca
    this.idempotencyKey = fields.idempotencyKey
  }
}
