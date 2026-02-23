import type { ICheckBookAvailabilityUseCase } from "@application/ports/inputs/ICheckBookAvailabilityUseCase";
import type { BookRepository } from "@application/ports/outputs/BookRepository";
import type { LoanRepository } from "@application/ports/outputs/LoanRepository";
import { BookNotFoundError } from "@application/errors/BookNotFoundError";

export class CheckBookAvailabilityUseCase implements ICheckBookAvailabilityUseCase {
  constructor(
    private readonly bookRepository: BookRepository,
    private readonly loanRepository: LoanRepository,
  ) {}

  async execute(bookId: string): Promise<{ available: boolean }> {
    const book = await this.bookRepository.findById(bookId);
    if (!book) throw new BookNotFoundError(bookId);

    const activeLoan = await this.loanRepository.findActiveByBookId(bookId);
    return { available: activeLoan === null };
  }
}
