import { PayablesRepository } from '@/modules/payables/data/repositories/payables-repository'
import { ListPayablesUseCase } from '@/modules/payables/application/use-cases/list-payables.use-case'
import { GetPayableUseCase } from '@/modules/payables/application/use-cases/get-payable.use-case'
import { CreatePayableUseCase } from '@/modules/payables/application/use-cases/create-payable.use-case'
import { PayPayableUseCase } from '@/modules/payables/application/use-cases/pay-payable.use-case'
import { CancelPayableUseCase } from '@/modules/payables/application/use-cases/cancel-payable.use-case'
import { PayablesListController } from '@/modules/payables/presentation/controllers/payables-list-controller'
import { PayableDetailController } from '@/modules/payables/presentation/controllers/payable-detail-controller'

export function makePayablesListController(): PayablesListController {
  const repository = new PayablesRepository()

  return new PayablesListController(
    new ListPayablesUseCase(repository),
    new CreatePayableUseCase(repository),
  )
}

export function makePayableDetailController(): PayableDetailController {
  const repository = new PayablesRepository()

  return new PayableDetailController(
    new GetPayableUseCase(repository),
    new PayPayableUseCase(repository),
    new CancelPayableUseCase(repository),
  )
}
