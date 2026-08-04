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

/**
 * Composition root do módulo fiscal. Monta repositórios e use-cases; os
 * controllers virão numa etapa posterior (ainda não há camada de apresentação).
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
