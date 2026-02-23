import type { ICreateMemberUseCase } from "@application/ports/inputs/ICreateMemberUseCase";
import type { MemberRepository } from "@application/ports/outputs/MemberRepository";
import type { CreateMemberRequestDTO } from "@application/dtos/member/CreateMemberRequestDTO";
import type { MemberResponseDTO } from "@application/dtos/member/MemberResponseDTO";
import { Member } from "@domain/entities/Member";

export class CreateMemberUseCase implements ICreateMemberUseCase {
  constructor(private readonly memberRepository: MemberRepository) {}

  async execute(dto: CreateMemberRequestDTO): Promise<MemberResponseDTO> {
    const member = new Member(crypto.randomUUID(), dto.name, dto.email);
    await this.memberRepository.save(member);
    return { id: member.id, name: member.name, email: member.email };
  }
}
