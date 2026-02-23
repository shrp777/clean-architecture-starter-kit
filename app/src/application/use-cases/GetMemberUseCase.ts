import type { IGetMemberUseCase } from "@application/ports/inputs/IGetMemberUseCase";
import type { MemberRepository } from "@application/ports/outputs/MemberRepository";
import type { MemberResponseDTO } from "@application/dtos/member/MemberResponseDTO";
import { MemberNotFoundError } from "@application/errors/MemberNotFoundError";

export class GetMemberUseCase implements IGetMemberUseCase {
  constructor(private readonly memberRepository: MemberRepository) {}

  async execute(id: string): Promise<MemberResponseDTO> {
    const member = await this.memberRepository.findById(id);
    if (!member) throw new MemberNotFoundError(id);
    return { id: member.id, name: member.name, email: member.email };
  }
}
