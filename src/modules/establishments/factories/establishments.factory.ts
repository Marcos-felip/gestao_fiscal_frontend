import { EstablishmentRepository } from '@/modules/establishments/data/repositories/establishment-repository'
import { ListEstablishmentsUseCase } from '@/modules/establishments/application/use-cases/list-establishments.use-case'
import { GetEstablishmentUseCase } from '@/modules/establishments/application/use-cases/get-establishment.use-case'
import { CreateEstablishmentUseCase } from '@/modules/establishments/application/use-cases/create-establishment.use-case'
import { UpdateEstablishmentUseCase } from '@/modules/establishments/application/use-cases/update-establishment.use-case'
import { DeleteEstablishmentUseCase } from '@/modules/establishments/application/use-cases/delete-establishment.use-case'
import { EstablishmentsListController } from '@/modules/establishments/presentation/controllers/establishments-list-controller'
import { EstablishmentFormController } from '@/modules/establishments/presentation/controllers/establishment-form-controller'

export function makeEstablishmentsListController(): EstablishmentsListController {
  const repository = new EstablishmentRepository()

  return new EstablishmentsListController(
    new ListEstablishmentsUseCase(repository),
    new DeleteEstablishmentUseCase(repository),
  )
}

export function makeEstablishmentFormController(): EstablishmentFormController {
  const repository = new EstablishmentRepository()

  return new EstablishmentFormController(
    new GetEstablishmentUseCase(repository),
    new CreateEstablishmentUseCase(repository),
    new UpdateEstablishmentUseCase(repository),
  )
}
