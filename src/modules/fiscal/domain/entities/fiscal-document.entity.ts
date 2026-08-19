import type { FiscalDocumentModel } from '@/core/enums/fiscal-document-model.enum'
import type { FiscalEnvironment } from '@/core/enums/fiscal-environment.enum'
import type { FiscalDocumentStatus } from '@/core/enums/fiscal-document-status.enum'
import type { FiscalSnapshot } from '@/modules/fiscal/domain/value-objects/fiscal-snapshot'
import type { FiscalStatusHistory } from '@/modules/fiscal/domain/entities/fiscal-status-history.entity'
import type { FiscalDocumentEvent } from '@/modules/fiscal/domain/entities/fiscal-document-event.entity'

/** Tipo de XML disponível em um documento fiscal. */
export type FiscalXmlType = 'enviado' | 'autorizado' | 'cancelamento'

/** Estabelecimento resumido referenciado pelo documento fiscal. */
export interface FiscalDocumentEstablishmentRef {
  id: string
  name: string
}

/** Venda resumida referenciada pelo documento fiscal. */
export interface FiscalDocumentSaleRef {
  id: string
  saleNumber: string | number
  totalAmount?: number | null
}

/**
 * Documento fiscal (NF-e/NFC-e) emitido a partir de uma venda ou avulso.
 * Os XMLs, o histórico de status e os eventos vêm sob demanda na resposta.
 */
export class FiscalDocument {
  readonly id: string
  readonly companyId: string
  readonly establishmentId: string
  readonly saleId: string | null
  readonly modelo: FiscalDocumentModel
  readonly serie: number
  readonly numero: number
  readonly chaveAcesso: string | null
  readonly ambiente: FiscalEnvironment
  readonly status: FiscalDocumentStatus
  readonly protocolo: string | null
  readonly rejeicaoCodigo: string | null
  readonly rejeicaoMensagem: string | null
  readonly dataEmissao: Date | null
  readonly dataAutorizacao: Date | null
  readonly dataCancelamento: Date | null
  readonly valorTotal: number | null
  readonly xmlEnviado: string | null
  readonly xmlAutorizado: string | null
  readonly xmlCancelamento: string | null
  readonly danfeUrl: string | null
  readonly qrCode: string | null
  readonly idempotencyKey: string | null
  readonly attempts: number
  readonly engine: string | null
  readonly snapshot: FiscalSnapshot | null
  /**
   * Havia snapshot e não foi possível lê-lo. Distingue "nota sem retrato" de
   * "retrato em formato desconhecido" — sem isso, a tela mostra uma nota sem
   * itens como se ela realmente não tivesse nenhum.
   */
  readonly snapshotIlegivel: boolean
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly establishment: FiscalDocumentEstablishmentRef | null
  readonly sale: FiscalDocumentSaleRef | null
  readonly statusHistory: FiscalStatusHistory[]
  readonly events: FiscalDocumentEvent[]

  constructor(fields: {
    id: string
    companyId: string
    establishmentId: string
    saleId: string | null
    modelo: FiscalDocumentModel
    serie: number
    numero: number
    chaveAcesso: string | null
    ambiente: FiscalEnvironment
    status: FiscalDocumentStatus
    protocolo: string | null
    rejeicaoCodigo: string | null
    rejeicaoMensagem: string | null
    dataEmissao: Date | null
    dataAutorizacao: Date | null
    dataCancelamento: Date | null
    valorTotal: number | null
    xmlEnviado: string | null
    xmlAutorizado: string | null
    xmlCancelamento: string | null
    danfeUrl: string | null
    qrCode: string | null
    idempotencyKey: string | null
    attempts: number
    engine: string | null
    snapshot: FiscalSnapshot | null
    snapshotIlegivel?: boolean
    createdAt: Date
    updatedAt: Date
    establishment: FiscalDocumentEstablishmentRef | null
    sale: FiscalDocumentSaleRef | null
    statusHistory: FiscalStatusHistory[]
    events: FiscalDocumentEvent[]
  }) {
    this.id = fields.id
    this.companyId = fields.companyId
    this.establishmentId = fields.establishmentId
    this.saleId = fields.saleId
    this.modelo = fields.modelo
    this.serie = fields.serie
    this.numero = fields.numero
    this.chaveAcesso = fields.chaveAcesso
    this.ambiente = fields.ambiente
    this.status = fields.status
    this.protocolo = fields.protocolo
    this.rejeicaoCodigo = fields.rejeicaoCodigo
    this.rejeicaoMensagem = fields.rejeicaoMensagem
    this.dataEmissao = fields.dataEmissao
    this.dataAutorizacao = fields.dataAutorizacao
    this.dataCancelamento = fields.dataCancelamento
    this.valorTotal = fields.valorTotal
    this.xmlEnviado = fields.xmlEnviado
    this.xmlAutorizado = fields.xmlAutorizado
    this.xmlCancelamento = fields.xmlCancelamento
    this.danfeUrl = fields.danfeUrl
    this.qrCode = fields.qrCode
    this.idempotencyKey = fields.idempotencyKey
    this.attempts = fields.attempts
    this.engine = fields.engine
    this.snapshot = fields.snapshot
    this.snapshotIlegivel = fields.snapshotIlegivel ?? false
    this.createdAt = fields.createdAt
    this.updatedAt = fields.updatedAt
    this.establishment = fields.establishment
    this.sale = fields.sale
    this.statusHistory = fields.statusHistory
    this.events = fields.events
  }

  get isAuthorized(): boolean {
    return this.status === 'AUTORIZADO'
  }

  get isRejected(): boolean {
    return this.status === 'REJEITADO'
  }

  /** Aguardando resolução na SEFAZ (fila ou processamento). */
  get isPending(): boolean {
    return this.status === 'PENDENTE' || this.status === 'PROCESSANDO'
  }

  get isCancelled(): boolean {
    return this.status === 'CANCELADO'
  }

  /** Há XML do tipo informado disponível para download. */
  hasXml(tipo: FiscalXmlType): boolean {
    if (tipo === 'enviado') return this.xmlEnviado !== null
    if (tipo === 'autorizado') return this.xmlAutorizado !== null
    return this.xmlCancelamento !== null
  }
}
