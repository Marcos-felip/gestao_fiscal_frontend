import { ReceivablesRepository } from '@/modules/receivables/data/repositories/receivables-repository'
import { ListReceivablesUseCase } from '@/modules/receivables/application/use-cases/list-receivables.use-case'
import { GetReceivableUseCase } from '@/modules/receivables/application/use-cases/get-receivable.use-case'
import { CreateReceivableUseCase } from '@/modules/receivables/application/use-cases/create-receivable.use-case'
import { PayReceivableUseCase } from '@/modules/receivables/application/use-cases/pay-receivable.use-case'
import { CancelReceivableUseCase } from '@/modules/receivables/application/use-cases/cancel-receivable.use-case'
import { ReceivablesListController } from '@/modules/receivables/presentation/controllers/receivables-list-controller'
import { ReceivableDetailController } from '@/modules/receivables/presentation/controllers/receivable-detail-controller'

export function makeReceivablesListController(): ReceivablesListController {
  const repository = new ReceivablesRepository()

  return new ReceivablesListController(
    new ListReceivablesUseCase(repository),
    new CreateReceivableUseCase(repository),
  )
}

export function makeReceivableDetailController(): ReceivableDetailController {
  const repository = new ReceivablesRepository()

  return new ReceivableDetailController(
    new GetReceivableUseCase(repository),
    new PayReceivableUseCase(repository),
    new CancelReceivableUseCase(repository),
  )
}
