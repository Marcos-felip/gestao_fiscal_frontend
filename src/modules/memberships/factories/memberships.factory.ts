import { MembershipsRepository } from '@/modules/memberships/data/repositories/memberships-repository'
import { ListMembershipsUseCase } from '@/modules/memberships/application/use-cases/list-memberships.use-case'
import { InviteUserUseCase } from '@/modules/memberships/application/use-cases/invite-user.use-case'
import { UpdateMemberRoleUseCase } from '@/modules/memberships/application/use-cases/update-member-role.use-case'
import { RemoveMemberUseCase } from '@/modules/memberships/application/use-cases/remove-member.use-case'
import { MembershipsController } from '@/modules/memberships/presentation/controllers/memberships-controller'

export function makeMembershipsController(): MembershipsController {
  const repository = new MembershipsRepository()

  return new MembershipsController(
    new ListMembershipsUseCase(repository),
    new InviteUserUseCase(repository),
    new UpdateMemberRoleUseCase(repository),
    new RemoveMemberUseCase(repository),
  )
}
