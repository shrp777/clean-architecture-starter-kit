import type { LoanResponseDTO } from "@application/dtos/loan/LoanResponseDTO";

export interface IGetMemberLoansUseCase {
  execute(memberId: string): Promise<LoanResponseDTO[]>;
}
