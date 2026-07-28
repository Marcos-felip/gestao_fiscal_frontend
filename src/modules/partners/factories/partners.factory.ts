import { PartnersRepository } from '@/modules/partners/data/repositories/partners-repository'
import { ListPartnersUseCase } from '@/modules/partners/application/use-cases/list-partners.use-case'
import { GetPartnerUseCase } from '@/modules/partners/application/use-cases/get-partner.use-case'
import { CreatePartnerUseCase } from '@/modules/partners/application/use-cases/create-partner.use-case'
import { UpdatePartnerUseCase } from '@/modules/partners/application/use-cases/update-partner.use-case'
import { DeletePartnerUseCase } from '@/modules/partners/application/use-cases/delete-partner.use-case'
import { PartnersListController } from '@/modules/partners/presentation/controllers/partners-list-controller'
import { PartnerFormController } from '@/modules/partners/presentation/controllers/partner-form-controller'

export function makePartnersListController(): PartnersListController {
  const repository = new PartnersRepository()

  return new PartnersListController(
    new ListPartnersUseCase(repository),
    new DeletePartnerUseCase(repository),
  )
}

export function makePartnerFormController(): PartnerFormController {
  const repository = new PartnersRepository()

  return new PartnerFormController(
    new GetPartnerUseCase(repository),
    new CreatePartnerUseCase(repository),
    new UpdatePartnerUseCase(repository),
  )
}
