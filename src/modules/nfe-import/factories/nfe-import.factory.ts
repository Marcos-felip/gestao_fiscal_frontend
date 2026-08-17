import { NfeImportRepository } from '@/modules/nfe-import/data/repositories/nfe-import-repository'
import { ImportNfeXmlUseCase } from '@/modules/nfe-import/application/use-cases/import-nfe-xml.use-case'
import { ListNfeImportsUseCase } from '@/modules/nfe-import/application/use-cases/list-nfe-imports.use-case'
import { GetNfeImportUseCase } from '@/modules/nfe-import/application/use-cases/get-nfe-import.use-case'
import { SetImportItemProductUseCase } from '@/modules/nfe-import/application/use-cases/set-import-item-product.use-case'
import { ConfirmNfeImportUseCase } from '@/modules/nfe-import/application/use-cases/confirm-nfe-import.use-case'
import { ProductsRepository } from '@/modules/products/data/repositories/products-repository'
import { ListProductsUseCase } from '@/modules/products/application/use-cases/list-products.use-case'
import { NfeImportsListController } from '@/modules/nfe-import/presentation/controllers/nfe-imports-list-controller'
import { NfeImportDetailController } from '@/modules/nfe-import/presentation/controllers/nfe-import-detail-controller'

export function makeNfeImportsListController(): NfeImportsListController {
  const repository = new NfeImportRepository()

  return new NfeImportsListController(
    new ListNfeImportsUseCase(repository),
    new ImportNfeXmlUseCase(repository),
  )
}

export function makeNfeImportDetailController(): NfeImportDetailController {
  const repository = new NfeImportRepository()

  return new NfeImportDetailController(
    new GetNfeImportUseCase(repository),
    new SetImportItemProductUseCase(repository),
    new ConfirmNfeImportUseCase(repository),
    // O seletor de produto precisa do catálogo: o wiring entre módulos vive na
    // factory, como em `purchases.factory`.
    new ListProductsUseCase(new ProductsRepository()),
  )
}
