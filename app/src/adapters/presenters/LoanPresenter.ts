import type { LoanResponseDTO } from "@application/dtos/loan/LoanResponseDTO";

export interface LoanView {
  id: string;
  bookId: string;
  memberId: string;
  borrowedAt: string;
  returnedAt?: string;
}

export class LoanPresenter {
  present(dto: LoanResponseDTO): LoanView {
    return {
      id: dto.id,
      bookId: dto.bookId,
      memberId: dto.memberId,
      borrowedAt: dto.borrowedAt,
      returnedAt: dto.returnedAt
    };
  }

  toResponse(dto: LoanResponseDTO, status = 200): Response {
    return Response.json(this.present(dto), { status });
  }

  toArrayResponse(dtos: LoanResponseDTO[], status = 200): Response {
    return Response.json(
      dtos.map((dto) => this.present(dto)),
      { status }
    );
  }
}
