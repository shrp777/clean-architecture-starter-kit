import type { IBorrowBookUseCase } from "@application/ports/inputs/IBorrowBookUseCase";
import type { BookRepository } from "@application/ports/outputs/BookRepository";
import type { LoanRepository } from "@application/ports/outputs/LoanRepository";
import type { BorrowBookRequestDTO } from "@application/dtos/loan/BorrowBookRequestDTO";
import type { LoanResponseDTO } from "@application/dtos/loan/LoanResponseDTO";
import { BookNotFoundError } from "@application/errors/BookNotFoundError";
import { BookAlreadyBorrowedError } from "@application/errors/BookAlreadyBorrowedError";
import { Loan } from "@domain/entities/Loan";

export class BorrowBookUseCase implements IBorrowBookUseCase {
  constructor(
    private readonly bookRepository: BookRepository,
    private readonly loanRepository: LoanRepository
  ) {}

  async execute(dto: BorrowBookRequestDTO): Promise<LoanResponseDTO> {
    const book = await this.bookRepository.findById(dto.bookId);
    if (!book) throw new BookNotFoundError(dto.bookId);

    const activeLoan = await this.loanRepository.findActiveByBookId(dto.bookId);
    if (activeLoan) throw new BookAlreadyBorrowedError(dto.bookId);

    const loan = new Loan(
      crypto.randomUUID(),
      dto.bookId,
      dto.memberId,
      new Date()
    );
    await this.loanRepository.save(loan);

    return {
      id: loan.id,
      bookId: loan.bookId,
      memberId: loan.memberId,
      borrowedAt: loan.borrowedAt.toISOString(),
      returnedAt: loan.returnedAt?.toISOString()
    };
  }
}
