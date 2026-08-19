import { NfeImportMatch } from '@/core/enums/nfe-import-match.enum'
import { NfeImportStatus } from '@/core/enums/nfe-import-status.enum'

/** Item da nota, com o que veio no XML e o resultado do casamento. */
export class NfeImportItem {
  readonly id: string
  readonly itemNumber: number
  /** Código do produto no cadastro **do fornecedor**. */
  readonly supplierCode: string
  readonly gtin: string | null
  readonly description: string
  readonly ncm: string | null
  readonly cest: string | null
  readonly cfop: string | null
  readonly unit: string
  readonly quantity: number
  readonly unitPrice: number
  readonly totalAmount: number
  readonly productId: string | null
  readonly match: NfeImportMatch
  /**
   * Quadro tributário **do fornecedor**, lido do grupo `imposto` do item.
   *
   * `origem` é propriedade da mercadoria e transfere direto. A situação
   * tributária é a da venda dele, sob o regime dele — ponto de partida para o
   * cadastro, nunca verdade sobre a nossa operação.
   */
  readonly origem: number | null
  readonly situacaoIcms: string | null
  readonly cstPis: string | null
  readonly cstCofins: string | null

  constructor(fields: {
    id: string
    itemNumber: number
    supplierCode: string
    gtin: string | null
    description: string
    ncm: string | null
    cest: string | null
    cfop: string | null
    unit: string
    quantity: number
    unitPrice: number
    totalAmount: number
    productId: string | null
    match: NfeImportMatch
    origem: number | null
    situacaoIcms: string | null
    cstPis: string | null
    cstCofins: string | null
  }) {
    this.id = fields.id
    this.itemNumber = fields.itemNumber
    this.supplierCode = fields.supplierCode
    this.gtin = fields.gtin
    this.description = fields.description
    this.ncm = fields.ncm
    this.cest = fields.cest
    this.cfop = fields.cfop
    this.unit = fields.unit
    this.quantity = fields.quantity
    this.unitPrice = fields.unitPrice
    this.totalAmount = fields.totalAmount
    this.productId = fields.productId
    this.match = fields.match
    this.origem = fields.origem
    this.situacaoIcms = fields.situacaoIcms
    this.cstPis = fields.cstPis
    this.cstCofins = fields.cstCofins
  }

  get isMatched(): boolean {
    return this.productId !== null
  }

  /**
   * O casamento veio da memória de uma importação anterior?
   *
   * A tela precisa distinguir isso de um casamento por código de barras: a
   * memória carrega o erro de quem escolheu daquela vez.
   */
  get isRemembered(): boolean {
    return this.match === NfeImportMatch.SUPPLIER_CODE
  }
}

/** Duplicata do grupo de cobrança da NF-e. */
export interface NfeImportDuplicata {
  numero: string | null
  vencimento: Date | null
  valor: number
}

export class NfeImport {
  readonly id: string
  readonly status: NfeImportStatus
  readonly chaveAcesso: string
  readonly number: number
  readonly series: number
  readonly issuedAt: Date
  readonly issuerCnpj: string
  readonly issuerName: string
  readonly totalAmount: number
  readonly supplierId: string | null
  readonly supplierName: string | null
  readonly establishmentName: string | null
  readonly purchaseId: string | null
  readonly purchaseNumber: number | null
  readonly duplicatas: NfeImportDuplicata[]
  readonly items: NfeImportItem[]
  readonly createdAt: Date | null

  constructor(fields: {
    id: string
    status: NfeImportStatus
    chaveAcesso: string
    number: number
    series: number
    issuedAt: Date
    issuerCnpj: string
    issuerName: string
    totalAmount: number
    supplierId: string | null
    supplierName: string | null
    establishmentName: string | null
    purchaseId: string | null
    purchaseNumber: number | null
    duplicatas: NfeImportDuplicata[]
    items: NfeImportItem[]
    createdAt: Date | null
  }) {
    this.id = fields.id
    this.status = fields.status
    this.chaveAcesso = fields.chaveAcesso
    this.number = fields.number
    this.series = fields.series
    this.issuedAt = fields.issuedAt
    this.issuerCnpj = fields.issuerCnpj
    this.issuerName = fields.issuerName
    this.totalAmount = fields.totalAmount
    this.supplierId = fields.supplierId
    this.supplierName = fields.supplierName
    this.establishmentName = fields.establishmentName
    this.purchaseId = fields.purchaseId
    this.purchaseNumber = fields.purchaseNumber
    this.duplicatas = fields.duplicatas
    this.items = fields.items
    this.createdAt = fields.createdAt
  }

  get unmatchedCount(): number {
    return this.items.filter((item) => !item.isMatched).length
  }

  get rememberedCount(): number {
    return this.items.filter((item) => item.isRemembered).length
  }

  /** Confirmar exige que todo item tenha produto — compra não fecha sem isso. */
  get canConfirm(): boolean {
    return (
      this.status !== NfeImportStatus.IMPORTED &&
      this.items.length > 0 &&
      this.unmatchedCount === 0
    )
  }

  get isImported(): boolean {
    return this.status === NfeImportStatus.IMPORTED
  }

  /**
   * Soma dos itens contra o total da nota.
   *
   * Diferente de zero é normal — frete, seguro e desconto entram no total sem
   * estar nos itens. Mas quem confere precisa ver antes de gerar a compra.
   */
  get itemsTotal(): number {
    return Number(
      this.items.reduce((total, item) => total + item.totalAmount, 0).toFixed(2),
    )
  }

  get totalDifference(): number {
    return Number((this.totalAmount - this.itemsTotal).toFixed(2))
  }
}
