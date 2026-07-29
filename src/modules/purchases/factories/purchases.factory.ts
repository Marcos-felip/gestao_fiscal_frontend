import { PurchasesRepository } from '@/modules/purchases/data/repositories/purchases-repository'
import { ListPurchasesUseCase } from '@/modules/purchases/application/use-cases/list-purchases.use-case'
import { GetPurchaseUseCase } from '@/modules/purchases/application/use-cases/get-purchase.use-case'
import { CreatePurchaseUseCase } from '@/modules/purchases/application/use-cases/create-purchase.use-case'
import { UpdatePurchaseUseCase } from '@/modules/purchases/application/use-cases/update-purchase.use-case'
import { ConfirmPurchaseUseCase } from '@/modules/purchases/application/use-cases/confirm-purchase.use-case'
import { CancelPurchaseUseCase } from '@/modules/purchases/application/use-cases/cancel-purchase.use-case'
import { DeletePurchaseUseCase } from '@/modules/purchases/application/use-cases/delete-purchase.use-case'
import { ProductsRepository } from '@/modules/products/data/repositories/products-repository'
import { ListProductsUseCase } from '@/modules/products/application/use-cases/list-products.use-case'
import { PartnersRepository } from '@/modules/partners/data/repositories/partners-repository'
import { ListPartnersUseCase } from '@/modules/partners/application/use-cases/list-partners.use-case'
import { EstablishmentRepository } from '@/modules/establishments/data/repositories/establishment-repository'
import { ListEstablishmentsUseCase } from '@/modules/establishments/application/use-cases/list-establishments.use-case'
import { PurchasesListController } from '@/modules/purchases/presentation/controllers/purchases-list-controller'
import { PurchaseFormController } from '@/modules/purchases/presentation/controllers/purchase-form-controller'
import { PurchaseDetailController } from '@/modules/purchases/presentation/controllers/purchase-detail-controller'

export function makePurchasesListController(): PurchasesListController {
  const repository = new PurchasesRepository()

  return new PurchasesListController(
    new ListPurchasesUseCase(repository),
    new DeletePurchaseUseCase(repository),
  )
}

export function makePurchaseFormController(): PurchaseFormController {
  const repository = new PurchasesRepository()

  return new PurchaseFormController(
    new CreatePurchaseUseCase(repository),
    new ListEstablishmentsUseCase(new EstablishmentRepository()),
    new ListProductsUseCase(new ProductsRepository()),
    new ListPartnersUseCase(new PartnersRepository()),
  )
}

export function makePurchaseDetailController(): PurchaseDetailController {
  const repository = new PurchasesRepository()

  return new PurchaseDetailController(
    new GetPurchaseUseCase(repository),
    new UpdatePurchaseUseCase(repository),
    new ConfirmPurchaseUseCase(repository),
    new CancelPurchaseUseCase(repository),
    new DeletePurchaseUseCase(repository),
    new ListPartnersUseCase(new PartnersRepository()),
  )
}
