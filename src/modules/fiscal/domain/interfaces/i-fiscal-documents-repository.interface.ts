import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type {
  FiscalDocument,
  FiscalXmlType,
} from '@/modules/fiscal/domain/entities/fiscal-document.entity'
import type { FiscalStatusHistory } from '@/modules/fiscal/domain/entities/fiscal-status-history.entity'
import type { FiscalDocumentEvent } from '@/modules/fiscal/domain/entities/fiscal-document-event.entity'
import type { FiscalDocumentListResponse } from '@/modules/fiscal/domain/responses/fiscal-document-list-response'
import type { QueryFiscalDocumentsDto } from '@/modules/fiscal/domain/dto/query-fiscal-documents-dto'
import type { EmitNfceDto } from '@/modules/fiscal/domain/dto/emit-nfce-dto'

export interface IFiscalDocumentsRepository {
  list(
    query: QueryFiscalDocumentsDto,
  ): Promise<Either<DomainError, FiscalDocumentListResponse>>
  getById(id: string): Promise<Either<DomainError, FiscalDocument>>
  /** Documento fiscal de uma venda, ou `null` se ela ainda não emitiu. */
  getBySale(saleId: string): Promise<Either<DomainError, FiscalDocument | null>>
  emitNfce(dto: EmitNfceDto): Promise<Either<DomainError, FiscalDocument>>
  getHistory(id: string): Promise<Either<DomainError, FiscalStatusHistory[]>>
  getEvents(id: string): Promise<Either<DomainError, FiscalDocumentEvent[]>>
  /** XML cru (string) do tipo informado. */
  getXml(id: string, tipo: FiscalXmlType): Promise<Either<DomainError, string>>
}
