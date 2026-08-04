import { FiscalSettingsRepository } from '@/modules/fiscal/data/repositories/fiscal-settings-repository'
import { FiscalDocumentsRepository } from '@/modules/fiscal/data/repositories/fiscal-documents-repository'
import { ListFiscalSettingsUseCase } from '@/modules/fiscal/application/use-cases/list-fiscal-settings.use-case'
import { GetFiscalSettingsByEstablishmentUseCase } from '@/modules/fiscal/application/use-cases/get-fiscal-settings-by-establishment.use-case'
import { CreateFiscalSettingsUseCase } from '@/modules/fiscal/application/use-cases/create-fiscal-settings.use-case'
import { UpdateFiscalSettingsUseCase } from '@/modules/fiscal/application/use-cases/update-fiscal-settings.use-case'
import { ListFiscalDocumentsUseCase } from '@/modules/fiscal/application/use-cases/list-fiscal-documents.use-case'
import { GetFiscalDocumentUseCase } from '@/modules/fiscal/application/use-cases/get-fiscal-document.use-case'
import { GetFiscalDocumentBySaleUseCase } from '@/modules/fiscal/application/use-cases/get-fiscal-document-by-sale.use-case'
import { EmitNfceUseCase } from '@/modules/fiscal/application/use-cases/emit-nfce.use-case'
import { GetFiscalDocumentHistoryUseCase } from '@/modules/fiscal/application/use-cases/get-fiscal-document-history.use-case'
import { GetFiscalDocumentEventsUseCase } from '@/modules/fiscal/application/use-cases/get-fiscal-document-events.use-case'
import { DownloadFiscalXmlUseCase } from '@/modules/fiscal/application/use-cases/download-fiscal-xml.use-case'
import { CancelFiscalDocumentUseCase } from '@/modules/fiscal/application/use-cases/cancel-fiscal-document.use-case'
import { ConsultFiscalDocumentUseCase } from '@/modules/fiscal/application/use-cases/consult-fiscal-document.use-case'
import { RetryFiscalDocumentUseCase } from '@/modules/fiscal/application/use-cases/retry-fiscal-document.use-case'
import { DownloadFiscalDanfeUseCase } from '@/modules/fiscal/application/use-cases/download-fiscal-danfe.use-case'
import { FiscalSettingsController } from '@/modules/fiscal/presentation/controllers/fiscal-settings-controller'
import type { FiscalEstablishmentsLoader } from '@/modules/fiscal/presentation/controllers/fiscal-settings-controller'
import { FiscalDocumentsListController } from '@/modules/fiscal/presentation/controllers/fiscal-documents-list-controller'
import type { FiscalDocumentsEstablishmentsLoader } from '@/modules/fiscal/presentation/controllers/fiscal-documents-list-controller'
import { FiscalDocumentDetailController } from '@/modules/fiscal/presentation/controllers/fiscal-document-detail-controller'
import { SaleFiscalController } from '@/modules/fiscal/presentation/controllers/sale-fiscal-controller'
import { EstablishmentRepository } from '@/modules/establishments/data/repositories/establishment-repository'
import { ListEstablishmentsUseCase } from '@/modules/establishments/application/use-cases/list-establishments.use-case'

/**
 * Composition root do módulo fiscal. Monta repositórios, use-cases e os
 * controllers da camada de apresentação.
 */

export function makeFiscalSettingsRepository(): FiscalSettingsRepository {
  return new FiscalSettingsRepository()
}

export function makeFiscalDocumentsRepository(): FiscalDocumentsRepository {
  return new FiscalDocumentsRepository()
}

export function makeListFiscalSettingsUseCase(): ListFiscalSettingsUseCase {
  return new ListFiscalSettingsUseCase(makeFiscalSettingsRepository())
}

export function makeGetFiscalSettingsByEstablishmentUseCase(): GetFiscalSettingsByEstablishmentUseCase {
  return new GetFiscalSettingsByEstablishmentUseCase(
    makeFiscalSettingsRepository(),
  )
}

export function makeCreateFiscalSettingsUseCase(): CreateFiscalSettingsUseCase {
  return new CreateFiscalSettingsUseCase(makeFiscalSettingsRepository())
}

export function makeUpdateFiscalSettingsUseCase(): UpdateFiscalSettingsUseCase {
  return new UpdateFiscalSettingsUseCase(makeFiscalSettingsRepository())
}

export function makeListFiscalDocumentsUseCase(): ListFiscalDocumentsUseCase {
  return new ListFiscalDocumentsUseCase(makeFiscalDocumentsRepository())
}

export function makeGetFiscalDocumentUseCase(): GetFiscalDocumentUseCase {
  return new GetFiscalDocumentUseCase(makeFiscalDocumentsRepository())
}

export function makeGetFiscalDocumentBySaleUseCase(): GetFiscalDocumentBySaleUseCase {
  return new GetFiscalDocumentBySaleUseCase(makeFiscalDocumentsRepository())
}

export function makeEmitNfceUseCase(): EmitNfceUseCase {
  return new EmitNfceUseCase(makeFiscalDocumentsRepository())
}

export function makeGetFiscalDocumentHistoryUseCase(): GetFiscalDocumentHistoryUseCase {
  return new GetFiscalDocumentHistoryUseCase(makeFiscalDocumentsRepository())
}

export function makeGetFiscalDocumentEventsUseCase(): GetFiscalDocumentEventsUseCase {
  return new GetFiscalDocumentEventsUseCase(makeFiscalDocumentsRepository())
}

export function makeDownloadFiscalXmlUseCase(): DownloadFiscalXmlUseCase {
  return new DownloadFiscalXmlUseCase(makeFiscalDocumentsRepository())
}

export function makeCancelFiscalDocumentUseCase(): CancelFiscalDocumentUseCase {
  return new CancelFiscalDocumentUseCase(makeFiscalDocumentsRepository())
}

export function makeConsultFiscalDocumentUseCase(): ConsultFiscalDocumentUseCase {
  return new ConsultFiscalDocumentUseCase(makeFiscalDocumentsRepository())
}

export function makeRetryFiscalDocumentUseCase(): RetryFiscalDocumentUseCase {
  return new RetryFiscalDocumentUseCase(makeFiscalDocumentsRepository())
}

export function makeDownloadFiscalDanfeUseCase(): DownloadFiscalDanfeUseCase {
  return new DownloadFiscalDanfeUseCase(makeFiscalDocumentsRepository())
}

/**
 * Adapta a listagem de estabelecimentos (outro módulo) para o formato mínimo
 * `{ id, name, type }` que a tela de configuração fiscal precisa. A costura
 * entre módulos vive na factory — o único ponto autorizado a cruzar fronteiras.
 */
function makeFiscalEstablishmentsLoader(): FiscalEstablishmentsLoader {
  const listEstablishments = new ListEstablishmentsUseCase(
    new EstablishmentRepository(),
  )
  return async () => {
    const result = await listEstablishments.execute()
    return result.map((items) =>
      items.map((e) => ({ id: e.id, name: e.name, type: e.type })),
    )
  }
}

/**
 * Adapta a listagem de estabelecimentos para o formato `{ id, name }` usado no
 * filtro da tela de documentos fiscais.
 */
function makeFiscalDocumentsEstablishmentsLoader(): FiscalDocumentsEstablishmentsLoader {
  const listEstablishments = new ListEstablishmentsUseCase(
    new EstablishmentRepository(),
  )
  return async () => {
    const result = await listEstablishments.execute()
    return result.map((items) => items.map((e) => ({ id: e.id, name: e.name })))
  }
}

export function makeFiscalDocumentsListController(): FiscalDocumentsListController {
  return new FiscalDocumentsListController(
    makeListFiscalDocumentsUseCase(),
    makeRetryFiscalDocumentUseCase(),
    makeFiscalDocumentsEstablishmentsLoader(),
  )
}

export function makeFiscalDocumentDetailController(): FiscalDocumentDetailController {
  return new FiscalDocumentDetailController(
    makeGetFiscalDocumentUseCase(),
    makeDownloadFiscalXmlUseCase(),
    makeCancelFiscalDocumentUseCase(),
    makeConsultFiscalDocumentUseCase(),
    makeRetryFiscalDocumentUseCase(),
    makeDownloadFiscalDanfeUseCase(),
  )
}

/**
 * Controller que orquestra o status fiscal na página de detalhe da venda:
 * documento vinculado, emissão manual (fallback) e polling do processamento.
 */
export function makeSaleFiscalController(): SaleFiscalController {
  return new SaleFiscalController(
    makeGetFiscalDocumentBySaleUseCase(),
    makeGetFiscalDocumentUseCase(),
    makeEmitNfceUseCase(),
  )
}

export function makeFiscalSettingsController(): FiscalSettingsController {
  const repository = makeFiscalSettingsRepository()

  return new FiscalSettingsController(
    new ListFiscalSettingsUseCase(repository),
    new GetFiscalSettingsByEstablishmentUseCase(repository),
    new CreateFiscalSettingsUseCase(repository),
    new UpdateFiscalSettingsUseCase(repository),
    makeFiscalEstablishmentsLoader(),
  )
}
