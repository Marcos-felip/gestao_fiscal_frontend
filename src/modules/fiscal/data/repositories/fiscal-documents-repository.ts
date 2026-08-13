import type { IFiscalDocumentsRepository } from '@/modules/fiscal/domain/interfaces/i-fiscal-documents-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type {
  FiscalDocument,
  FiscalXmlType,
} from '@/modules/fiscal/domain/entities/fiscal-document.entity'
import type { FiscalStatusHistory } from '@/modules/fiscal/domain/entities/fiscal-status-history.entity'
import type { FiscalDocumentEvent } from '@/modules/fiscal/domain/entities/fiscal-document-event.entity'
import type { FiscalDocumentListResponse } from '@/modules/fiscal/domain/responses/fiscal-document-list-response'
import type { FiscalRejectionListResponse } from '@/modules/fiscal/domain/responses/fiscal-rejection-item'
import type { FiscalConsultaResult } from '@/modules/fiscal/domain/responses/fiscal-consulta-result'
import type { QueryFiscalDocumentsDto } from '@/modules/fiscal/domain/dto/query-fiscal-documents-dto'
import type { EmitNfceDto } from '@/modules/fiscal/domain/dto/emit-nfce-dto'
import type { EmitNfeDto } from '@/modules/fiscal/domain/dto/emit-nfe-dto'
import type { ExportFiscalXmlsDto } from '@/modules/fiscal/domain/dto/export-fiscal-xmls-dto'
import { httpClient } from '@/core/client/http-client'
import {
  toFiscalDocument,
  toFiscalDocumentOrNull,
  toFiscalDocumentList,
  toFiscalStatusHistory,
  toFiscalDocumentEvent,
} from '@/modules/fiscal/data/mappers/fiscal-document.mapper'
import { toFiscalConsultaResult } from '@/modules/fiscal/data/mappers/fiscal-consulta.mapper'
import { toFiscalRejectionList } from '@/modules/fiscal/data/mappers/fiscal-production.mapper'

export class FiscalDocumentsRepository implements IFiscalDocumentsRepository {
  async list(
    query: QueryFiscalDocumentsDto,
  ): Promise<Either<DomainError, FiscalDocumentListResponse>> {
    const params: Record<string, string | number> = {}
    if (query.page !== undefined) params.page = query.page
    if (query.limit !== undefined) params.limit = query.limit
    if (query.status) params.status = query.status
    if (query.modelo) params.modelo = query.modelo
    if (query.saleId) params.saleId = query.saleId
    if (query.establishmentId) params.establishmentId = query.establishmentId
    if (query.startDate) params.startDate = query.startDate
    if (query.endDate) params.endDate = query.endDate

    const result = await httpClient.get<unknown>('/fiscal/documents', {
      params,
    })
    return result.flatMap(toFiscalDocumentList)
  }

  async getById(id: string): Promise<Either<DomainError, FiscalDocument>> {
    const result = await httpClient.get<unknown>(`/fiscal/documents/${id}`)
    return result.flatMap(toFiscalDocument)
  }

  async getBySale(
    saleId: string,
  ): Promise<Either<DomainError, FiscalDocument | null>> {
    const result = await httpClient.get<unknown>(
      `/fiscal/documents/sale/${saleId}`,
    )
    return result.flatMap(toFiscalDocumentOrNull)
  }

  async emitNfce(
    dto: EmitNfceDto,
  ): Promise<Either<DomainError, FiscalDocument>> {
    const payload: Record<string, unknown> = { saleId: dto.saleId }
    if (dto.establishmentId !== undefined)
      payload.establishmentId = dto.establishmentId
    if (dto.idempotencyKey !== undefined)
      payload.idempotencyKey = dto.idempotencyKey
    if (dto.payments !== undefined) payload.payments = dto.payments

    const result = await httpClient.post<unknown>(
      '/fiscal/documents/nfce',
      payload,
    )
    return result.flatMap(toFiscalDocument)
  }

  async emitNfe(dto: EmitNfeDto): Promise<Either<DomainError, FiscalDocument>> {
    const payload: Record<string, unknown> = {
      saleId: dto.saleId,
      consumidorFinal: dto.consumidorFinal,
    }
    if (dto.establishmentId !== undefined)
      payload.establishmentId = dto.establishmentId
    if (dto.naturezaOperacao !== undefined)
      payload.naturezaOperacao = dto.naturezaOperacao
    if (dto.presenca !== undefined) payload.presenca = dto.presenca
    if (dto.transporte !== undefined) payload.transporte = dto.transporte
    if (dto.cobranca !== undefined) payload.cobranca = dto.cobranca
    if (dto.idempotencyKey !== undefined)
      payload.idempotencyKey = dto.idempotencyKey

    const result = await httpClient.post<unknown>(
      '/fiscal/documents/nfe',
      payload,
    )
    return result.flatMap(toFiscalDocument)
  }

  async getHistory(
    id: string,
  ): Promise<Either<DomainError, FiscalStatusHistory[]>> {
    const result = await httpClient.get<unknown>(
      `/fiscal/documents/${id}/history`,
    )
    return result.flatMap(toFiscalStatusHistory)
  }

  async getEvents(
    id: string,
  ): Promise<Either<DomainError, FiscalDocumentEvent[]>> {
    const result = await httpClient.get<unknown>(
      `/fiscal/documents/${id}/events`,
    )
    return result.flatMap(toFiscalDocumentEvent)
  }

  async getXml(
    id: string,
    tipo: FiscalXmlType,
  ): Promise<Either<DomainError, string>> {
    // O XML volta como texto cru, não JSON.
    return httpClient.get<string>(`/fiscal/documents/${id}/xml/${tipo}`, {
      responseType: 'text',
    })
  }

  async cancel(
    id: string,
    justificativa: string,
  ): Promise<Either<DomainError, FiscalDocument>> {
    const result = await httpClient.post<unknown>(
      `/fiscal/documents/${id}/cancel`,
      { justificativa },
    )
    return result.flatMap(toFiscalDocument)
  }

  async consulta(
    id: string,
  ): Promise<Either<DomainError, FiscalConsultaResult>> {
    const result = await httpClient.post<unknown>(
      `/fiscal/documents/${id}/consulta`,
    )
    return result.flatMap(toFiscalConsultaResult)
  }

  async retry(id: string): Promise<Either<DomainError, FiscalDocument>> {
    const result = await httpClient.post<unknown>(
      `/fiscal/documents/${id}/retry`,
    )
    return result.flatMap(toFiscalDocument)
  }

  async downloadDanfe(id: string): Promise<Either<DomainError, Blob>> {
    return httpClient.get<Blob>(`/fiscal/documents/${id}/danfe`, {
      responseType: 'blob',
    })
  }

  async exportXmls(
    dto: ExportFiscalXmlsDto,
  ): Promise<Either<DomainError, Blob>> {
    const params: Record<string, string> = {
      dataInicio: dto.dataInicio,
      dataFim: dto.dataFim,
    }
    if (dto.establishmentId) params.establishmentId = dto.establishmentId
    if (dto.modelo) params.modelo = dto.modelo
    if (dto.ambiente) params.ambiente = dto.ambiente

    // ZIP em stream: resposta binária, sem mapper — não é JSON.
    return httpClient.get<Blob>('/fiscal/documents/xml/export', {
      params,
      responseType: 'blob',
    })
  }

  async getRejections(
    query: QueryFiscalDocumentsDto,
  ): Promise<Either<DomainError, FiscalRejectionListResponse>> {
    const params: Record<string, string | number> = {}
    if (query.page !== undefined) params.page = query.page
    if (query.limit !== undefined) params.limit = query.limit
    if (query.status) params.status = query.status
    if (query.modelo) params.modelo = query.modelo
    if (query.saleId) params.saleId = query.saleId
    if (query.establishmentId) params.establishmentId = query.establishmentId
    if (query.startDate) params.startDate = query.startDate
    if (query.endDate) params.endDate = query.endDate

    const result = await httpClient.get<unknown>('/fiscal/rejections', {
      params,
    })
    return result.flatMap(toFiscalRejectionList)
  }
}
