import type { MemberResponseDTO } from "@application/dtos/member/MemberResponseDTO";

export interface MemberView {
  id: string;
  name: string;
  email: string;
}

export class MemberPresenter {
  present(dto: MemberResponseDTO): MemberView {
    return { id: dto.id, name: dto.name, email: dto.email };
  }

  toResponse(dto: MemberResponseDTO, status = 200): Response {
    return Response.json(this.present(dto), { status });
  }
}
