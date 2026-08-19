import { z } from 'zod'
import { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { ContractError } from '@/core/errors/contract-error'
import { FiscalDocument } from '@/modules/fiscal/domain/entities/fiscal-document.entity'
import { FiscalStatusHistory } from '@/modules/fiscal/domain/entities/fiscal-status-history.entity'
import { FiscalDocumentEvent } from '@/modules/fiscal/domain/entities/fiscal-document-event.entity'
import { toFiscalSnapshot } from '@/modules/fiscal/data/mappers/fiscal-snapshot.mapper'
import type { FiscalDocumentListResponse } from '@/modules/fiscal/domain/responses/fiscal-document-list-response'
import type { FiscalDocumentModel } from '@/core/enums/fiscal-document-model.enum'
import type { FiscalEnvironment } from '@/core/enums/fiscal-environment.enum'
import type { FiscalDocumentStatus } from '@/core/enums/fiscal-document-status.enum'
import { toIssueList } from '@/core/utils/zod-errors'

// `valorTotal` chega como STRING (Prisma.Decimal.toJSON); os valores DENTRO do
// snapshot já vêm como number.
const nullableDecimal = z
  .union([z.number(), z.string()])
  .nullable()
  .default(null)

function toNumberOrNull(value: number | string | null): number | null {
  if (value === null) return null
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function toDate(value: string): Date {
  return new Date(value)
}

function toDateOrNull(value: string | null): Date | null {
  return value === null ? null : new Date(value)
}

const establishmentRefSchema = z
  .object({ id: z.string(), name: z.string() })
  .nullable()
  .default(null)

const saleRefSchema = z
  .object({
    id: z.string(),
    saleNumber: z.union([z.string(), z.number()]),
    totalAmount: nullableDecimal,
  })
  .nullable()
  .default(null)

const statusHistorySchema = z.object({
  id: z.string(),
  fiscalDocumentId: z.string(),
  statusFrom: z.string(),
  statusTo: z.string(),
  motivo: z.string().nullable().default(null),
  usuarioId: z.string().nullable().default(null),
  createdAt: z.string(),
})

const eventSchema = z.object({
  id: z.string(),
  fiscalDocumentId: z.string(),
  tipo: z.string(),
  detalhes: z.unknown().nullable().default(null),
  usuarioId: z.string().nullable().default(null),
  createdAt: z.string(),
})

const fiscalDocumentSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  establishmentId: z.string(),
  saleId: z.string().nullable().default(null),
  modelo: z.string(),
  serie: z.number().default(0),
  numero: z.number().default(0),
  chaveAcesso: z.string().nullable().default(null),
  ambiente: z.string(),
  status: z.string(),
  protocolo: z.string().nullable().default(null),
  rejeicaoCodigo: z.string().nullable().default(null),
  rejeicaoMensagem: z.string().nullable().default(null),
  dataEmissao: z.string().nullable().default(null),
  dataAutorizacao: z.string().nullable().default(null),
  dataCancelamento: z.string().nullable().default(null),
  valorTotal: nullableDecimal,
  xmlEnviado: z.string().nullable().default(null),
  xmlAutorizado: z.string().nullable().default(null),
  xmlCancelamento: z.string().nullable().default(null),
  danfeUrl: z.string().nullable().default(null),
  qrCode: z.string().nullable().default(null),
  idempotencyKey: z.string().nullable().default(null),
  attempts: z.number().default(0),
  engine: z.string().nullable().default(null),
  snapshot: z.unknown().nullable().default(null),
  createdAt: z.string(),
  updatedAt: z.string(),
  establishment: establishmentRefSchema,
  sale: saleRefSchema,
  statusHistory: z.array(statusHistorySchema).default([]),
  events: z.array(eventSchema).default([]),
})

const fiscalDocumentListSchema = z.object({
  data: z.array(fiscalDocumentSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
})

type FiscalDocumentPayload = z.infer<typeof fiscalDocumentSchema>
type StatusHistoryPayload = z.infer<typeof statusHistorySchema>
type EventPayload = z.infer<typeof eventSchema>

function buildStatusHistory(value: StatusHistoryPayload): FiscalStatusHistory {
  return new FiscalStatusHistory({
    id: value.id,
    fiscalDocumentId: value.fiscalDocumentId,
    statusFrom: value.statusFrom as FiscalDocumentStatus,
    statusTo: value.statusTo as FiscalDocumentStatus,
    motivo: value.motivo,
    usuarioId: value.usuarioId,
    createdAt: toDate(value.createdAt),
  })
}

function buildEvent(value: EventPayload): FiscalDocumentEvent {
  return new FiscalDocumentEvent({
    id: value.id,
    fiscalDocumentId: value.fiscalDocumentId,
    tipo: value.tipo,
    detalhes: value.detalhes ?? null,
    usuarioId: value.usuarioId,
    createdAt: toDate(value.createdAt),
  })
}

function build(value: FiscalDocumentPayload): FiscalDocument {
  const snapshot = toFiscalSnapshot(value.snapshot)

  return new FiscalDocument({
    id: value.id,
    companyId: value.companyId,
    establishmentId: value.establishmentId,
    saleId: value.saleId,
    modelo: value.modelo as FiscalDocumentModel,
    serie: value.serie,
    numero: value.numero,
    chaveAcesso: value.chaveAcesso,
    ambiente: value.ambiente as FiscalEnvironment,
    status: value.status as FiscalDocumentStatus,
    protocolo: value.protocolo,
    rejeicaoCodigo: value.rejeicaoCodigo,
    rejeicaoMensagem: value.rejeicaoMensagem,
    dataEmissao: toDateOrNull(value.dataEmissao),
    dataAutorizacao: toDateOrNull(value.dataAutorizacao),
    dataCancelamento: toDateOrNull(value.dataCancelamento),
    valorTotal: toNumberOrNull(value.valorTotal),
    xmlEnviado: value.xmlEnviado,
    xmlAutorizado: value.xmlAutorizado,
    xmlCancelamento: value.xmlCancelamento,
    danfeUrl: value.danfeUrl,
    qrCode: value.qrCode,
    idempotencyKey: value.idempotencyKey,
    attempts: value.attempts,
    engine: value.engine,
    snapshot,
    // Havia snapshot e não foi possível lê-lo: a tela precisa dizer isso, em
    // vez de mostrar uma nota sem itens.
    snapshotIlegivel: value.snapshot != null && snapshot === null,
    createdAt: toDate(value.createdAt),
    updatedAt: toDate(value.updatedAt),
    establishment: value.establishment
      ? { id: value.establishment.id, name: value.establishment.name }
      : null,
    sale: value.sale
      ? {
          id: value.sale.id,
          saleNumber: value.sale.saleNumber,
          totalAmount: toNumberOrNull(value.sale.totalAmount),
        }
      : null,
    statusHistory: value.statusHistory.map(buildStatusHistory),
    events: value.events.map(buildEvent),
  })
}

export function toFiscalDocument(
  data: unknown,
): Either<DomainError, FiscalDocument> {
  const parsed = fiscalDocumentSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(
      new ContractError('fiscal-documents', toIssueList(parsed.error)),
    )
  }

  return Either.right(build(parsed.data))
}

/** `GET /fiscal/documents/sale/:saleId` devolve o documento ou `null`. */
export function toFiscalDocumentOrNull(
  data: unknown,
): Either<DomainError, FiscalDocument | null> {
  if (data === null || data === undefined || data === '') {
    return Either.right(null)
  }
  return toFiscalDocument(data)
}

export function toFiscalDocumentList(
  data: unknown,
): Either<DomainError, FiscalDocumentListResponse> {
  const parsed = fiscalDocumentListSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(
      new ContractError('fiscal-documents', toIssueList(parsed.error)),
    )
  }

  const value = parsed.data
  const totalPages = value.limit > 0 ? Math.ceil(value.total / value.limit) : 0
  return Either.right({
    items: value.data.map(build),
    total: value.total,
    page: value.page,
    limit: value.limit,
    totalPages,
    hasNext: value.page < totalPages,
  })
}

export function toFiscalStatusHistory(
  data: unknown,
): Either<DomainError, FiscalStatusHistory[]> {
  const parsed = z.array(statusHistorySchema).safeParse(data)

  if (!parsed.success) {
    return Either.left(
      new ContractError('fiscal-status-history', toIssueList(parsed.error)),
    )
  }

  return Either.right(parsed.data.map(buildStatusHistory))
}

export function toFiscalDocumentEvent(
  data: unknown,
): Either<DomainError, FiscalDocumentEvent[]> {
  const parsed = z.array(eventSchema).safeParse(data)

  if (!parsed.success) {
    return Either.left(
      new ContractError('fiscal-document-events', toIssueList(parsed.error)),
    )
  }

  return Either.right(parsed.data.map(buildEvent))
}
