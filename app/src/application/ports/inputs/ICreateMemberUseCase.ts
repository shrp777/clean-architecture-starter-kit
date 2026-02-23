import type { CreateMemberRequestDTO } from "@application/dtos/member/CreateMemberRequestDTO";
import type { MemberResponseDTO } from "@application/dtos/member/MemberResponseDTO";

export interface ICreateMemberUseCase {
  execute(dto: CreateMemberRequestDTO): Promise<MemberResponseDTO>;
}
