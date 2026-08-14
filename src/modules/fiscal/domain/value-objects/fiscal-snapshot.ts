/**
 * Retrato imutável do que foi enviado à SEFAZ, congelado na emissão.
 *
 * Existe porque cadastro muda e nota emitida não: se o preço subir, o produto
 * for renomeado ou o cliente mudar de endereço, a nota já emitida continua
 * tendo que mostrar o que valia quando foi emitida. É o que o contador
 * escritura e o que o fisco confere.
 *
 * ## Os nomes são em português, e isso já custou caro
 *
 * Esta interface descrevia o formato **antigo**, em inglês (`items`,
 * `payments`, `sale`). O backend passou a gravar em português na etapa 1 do
 * roteiro fiscal, com `versao: 2`, e ninguém acompanhou — como todo campo é
 * opcional, `snapshot.items` virava `undefined` e a tela renderizava uma lista
 * vazia, sem erro nenhum. O detalhe de **toda** nota ficou assim por dois dias.
 *
 * Os valores dentro do snapshot já são números; só o `valorTotal` do documento
 * (fora do snapshot) chega como decimal-string.
 */

/** Quadro tributário de um item, com os nomes das tags do layout da NF-e. */
export interface FiscalSnapshotIcms {
  /** CSOSN (3 dígitos, Simples) ou CST (2 dígitos, Regime Normal) */
  situacao: string
  /** Origem da mercadoria, 0 a 8 */
  origem: number
  vBC?: number
  pICMS?: number
  vICMS?: number
  pRedBC?: number
  vBCST?: number
  pICMSST?: number
  vICMSST?: number
}

export interface FiscalSnapshotContribuicao {
  /** CST da contribuição */
  situacao: string
  vBC?: number
  aliquota?: number
  valor?: number
}

export interface FiscalSnapshotImposto {
  icms: FiscalSnapshotIcms
  pis: FiscalSnapshotContribuicao
  cofins: FiscalSnapshotContribuicao
}

export interface FiscalSnapshotItem {
  numeroItem: number
  codigoProduto: string
  descricao: string
  ncm: string
  cest?: string
  cfop: string
  unidadeComercial: string
  quantidade: number
  valorUnitario: number
  gtin?: string
  imposto?: FiscalSnapshotImposto
}

export interface FiscalSnapshotPagamento {
  tipo: string
  valor: number
}

export interface FiscalSnapshotVenda {
  id: string
  numero: number
  subtotal: number
  desconto: number
  total: number
  data: string
}

export interface FiscalSnapshotEmitente {
  cnpj: string
  razaoSocial: string
  nomeFantasia?: string
  inscricaoEstadual: string
  crt: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  codigoMunicipio: string
  municipio: string
  uf: string
  cep: string
  telefone?: string
  email?: string
}

/** Destinatário da NFC-e: bloco opcional, ausente no consumidor não identificado. */
export interface FiscalSnapshotDestinatario {
  cpfCnpj?: string
  nome?: string
  logradouro?: string
  numero?: string
  bairro?: string
  municipio?: string
  uf?: string
  cep?: string
}

/** Destinatário da NF-e: completo e obrigatório. */
export interface FiscalSnapshotDestinatarioNfe {
  cpfCnpj: string
  nome: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  codigoMunicipio: string
  municipio: string
  uf: string
  cep: string
  /** `indIEDest`: 1 contribuinte · 2 isento · 9 não contribuinte */
  indicadorIe: number
  inscricaoEstadual?: string
  telefone?: string
  email?: string
}

export interface FiscalSnapshotTransporte {
  modalidadeFrete?: number
  transportadora?: {
    cpfCnpj?: string
    nome?: string
    municipio?: string
    uf?: string
  }
  volumes?: {
    quantidade?: number
    especie?: string
    pesoLiquido?: number
    pesoBruto?: number
  }[]
}

export interface FiscalSnapshotCobranca {
  fatura?: { numero?: string; valorOriginal?: number; valorLiquido?: number }
  duplicatas?: { numero?: string; vencimento?: string; valor?: number }[]
}

/** Cabeçalho que só a NF-e tem. */
export interface FiscalSnapshotNfe {
  naturezaOperacao: string
  /** 0 entrada · 1 saída */
  tipoOperacao: number
  /** 1 normal · 2 complementar · 3 ajuste · 4 devolução */
  finalidade: number
  /** `indFinal`: venda para consumo (true) ou para revenda (false) */
  consumidorFinal: boolean
  /** `indPres` */
  presenca: number
  transporte?: FiscalSnapshotTransporte
  cobranca?: FiscalSnapshotCobranca
}

/** Totais fiscais somados dos itens. */
export interface FiscalSnapshotTotais {
  vProd: number
  vBC: number
  vICMS: number
  vST: number
  vPIS: number
  vCOFINS: number
  vNF: number
}

/** Dinheiro entregue e troco — auditoria e reimpressão, não vai à SEFAZ. */
export interface FiscalSnapshotRecebimento {
  valorRecebido: number
  troco: number
}

export interface FiscalSnapshot {
  versao: number
  /** Ausente nos snapshots anteriores à NF-e, que são todos NFC-e. */
  modelo?: 'NFCE' | 'NFE'
  venda: FiscalSnapshotVenda
  emitente: FiscalSnapshotEmitente
  destinatario?: FiscalSnapshotDestinatario
  destinatarioNfe?: FiscalSnapshotDestinatarioNfe
  nfe?: FiscalSnapshotNfe
  itens: FiscalSnapshotItem[]
  pagamentos: FiscalSnapshotPagamento[]
  valorTotal: number
  totais?: FiscalSnapshotTotais
  recebimento?: FiscalSnapshotRecebimento
}
