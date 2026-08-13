import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type {
  FiscalDocument,
  FiscalXmlType,
} from '@/modules/fiscal/domain/entities/fiscal-document.entity'
import type { FiscalStatusHistory } from '@/modules/fiscal/domain/entities/fiscal-status-history.entity'
import type { FiscalDocumentEvent } from '@/modules/fiscal/domain/entities/fiscal-document-event.entity'
import type { FiscalDocumentListResponse } from '@/modules/fiscal/domain/responses/fiscal-document-list-response'
import type { FiscalConsultaResult } from '@/modules/fiscal/domain/responses/fiscal-consulta-result'
import type { QueryFiscalDocumentsDto } from '@/modules/fiscal/domain/dto/query-fiscal-documents-dto'
import type { EmitNfceDto } from '@/modules/fiscal/domain/dto/emit-nfce-dto'
import type { EmitNfeDto } from '@/modules/fiscal/domain/dto/emit-nfe-dto'
import type { ExportFiscalXmlsDto } from '@/modules/fiscal/domain/dto/export-fiscal-xmls-dto'

export interface IFiscalDocumentsRepository {
  list(
    query: QueryFiscalDocumentsDto,
  ): Promise<Either<DomainError, FiscalDocumentListResponse>>
  getById(id: string): Promise<Either<DomainError, FiscalDocument>>
  getBySale(saleId: string): Promise<Either<DomainError, FiscalDocument | null>>
  emitNfce(dto: EmitNfceDto): Promise<Either<DomainError, FiscalDocument>>

  /**
   * Emite NF-e modelo 55. Rota e permissão próprias — quem opera o caixa não
   * necessariamente emite NF-e.
   */
  emitNfe(dto: EmitNfeDto): Promise<Either<DomainError, FiscalDocument>>
  getHistory(id: string): Promise<Either<DomainError, FiscalStatusHistory[]>>
  getEvents(id: string): Promise<Either<DomainError, FiscalDocumentEvent[]>>
  getXml(id: string, tipo: FiscalXmlType): Promise<Either<DomainError, string>>
  cancel(
    id: string,
    justificativa: string,
  ): Promise<Either<DomainError, FiscalDocument>>
  consulta(id: string): Promise<Either<DomainError, FiscalConsultaResult>>
  retry(id: string): Promise<Either<DomainError, FiscalDocument>>
  downloadDanfe(id: string): Promise<Either<DomainError, Blob>>
  exportXmls(dto: ExportFiscalXmlsDto): Promise<Either<DomainError, Blob>>
}
