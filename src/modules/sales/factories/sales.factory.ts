import { SalesRepository } from '@/modules/sales/data/repositories/sales-repository'
import { ListSalesUseCase } from '@/modules/sales/application/use-cases/list-sales.use-case'
import { GetSaleUseCase } from '@/modules/sales/application/use-cases/get-sale.use-case'
import { CreateSaleUseCase } from '@/modules/sales/application/use-cases/create-sale.use-case'
import { ConfirmSaleUseCase } from '@/modules/sales/application/use-cases/confirm-sale.use-case'
import { CancelSaleUseCase } from '@/modules/sales/application/use-cases/cancel-sale.use-case'
import { DeleteSaleUseCase } from '@/modules/sales/application/use-cases/delete-sale.use-case'
import { GetSaleContextUseCase } from '@/modules/sales/application/use-cases/get-sale-context.use-case'
import { SalesListController } from '@/modules/sales/presentation/controllers/sales-list-controller'
import { SaleFormController } from '@/modules/sales/presentation/controllers/sale-form-controller'
import { SaleDetailController } from '@/modules/sales/presentation/controllers/sale-detail-controller'

export function makeSalesListController(): SalesListController {
  const repository = new SalesRepository()

  return new SalesListController(new ListSalesUseCase(repository))
}

export function makeSaleFormController(): SaleFormController {
  const repository = new SalesRepository()

  return new SaleFormController(
    new CreateSaleUseCase(repository),
    new GetSaleContextUseCase(repository),
  )
}

export function makeSaleDetailController(): SaleDetailController {
  const repository = new SalesRepository()

  return new SaleDetailController(
    new GetSaleUseCase(repository),
    new ConfirmSaleUseCase(repository),
    new CancelSaleUseCase(repository),
    new DeleteSaleUseCase(repository),
  )
}
