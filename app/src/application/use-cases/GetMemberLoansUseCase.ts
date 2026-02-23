import type { IGetMemberLoansUseCase } from "@application/ports/inputs/IGetMemberLoansUseCase";
import type { LoanRepository } from "@application/ports/outputs/LoanRepository";
import type { LoanResponseDTO } from "@application/dtos/loan/LoanResponseDTO";

export class GetMemberLoansUseCase implements IGetMemberLoansUseCase {
  constructor(private readonly loanRepository: LoanRepository) {}

  async execute(memberId: string): Promise<LoanResponseDTO[]> {
    const loans = await this.loanRepository.findByMemberId(memberId);
    return loans.map((loan) => ({
      id: loan.id,
      bookId: loan.bookId,
      memberId: loan.memberId,
      borrowedAt: loan.borrowedAt.toISOString(),
      returnedAt: loan.returnedAt?.toISOString()
    }));
  }
}
