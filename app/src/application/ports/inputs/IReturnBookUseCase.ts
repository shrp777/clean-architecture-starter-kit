import type { LoanResponseDTO } from "@application/dtos/loan/LoanResponseDTO";

export interface IReturnBookUseCase {
  execute(loanId: string): Promise<LoanResponseDTO>;
}
