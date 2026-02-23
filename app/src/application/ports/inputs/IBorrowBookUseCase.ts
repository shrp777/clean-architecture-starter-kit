import type { BorrowBookRequestDTO } from "@application/dtos/loan/BorrowBookRequestDTO";
import type { LoanResponseDTO } from "@application/dtos/loan/LoanResponseDTO";

export interface IBorrowBookUseCase {
  execute(dto: BorrowBookRequestDTO): Promise<LoanResponseDTO>;
}
