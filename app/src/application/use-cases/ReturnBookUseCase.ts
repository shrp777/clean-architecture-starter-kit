import type { IReturnBookUseCase } from "@application/ports/inputs/IReturnBookUseCase";
import type { LoanRepository } from "@application/ports/outputs/LoanRepository";
import type { LoanResponseDTO } from "@application/dtos/loan/LoanResponseDTO";
import { LoanNotFoundError } from "@application/errors/LoanNotFoundError";

export class ReturnBookUseCase implements IReturnBookUseCase {
  constructor(private readonly loanRepository: LoanRepository) {}

  async execute(loanId: string): Promise<LoanResponseDTO> {
    const loan = await this.loanRepository.findById(loanId);
    if (!loan) throw new LoanNotFoundError(loanId);

    const returned = loan.giveBack();
    await this.loanRepository.save(returned);

    return {
      id: returned.id,
      bookId: returned.bookId,
      memberId: returned.memberId,
      borrowedAt: returned.borrowedAt.toISOString(),
      returnedAt: returned.returnedAt?.toISOString()
    };
  }
}
