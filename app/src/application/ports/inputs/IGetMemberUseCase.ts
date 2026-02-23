import type { MemberResponseDTO } from "@application/dtos/member/MemberResponseDTO";

export interface IGetMemberUseCase {
  execute(id: string): Promise<MemberResponseDTO>;
}
