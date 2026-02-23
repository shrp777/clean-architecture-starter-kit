import type { LoanRepository } from "@application/ports/outputs/LoanRepository";
import type { Loan } from "@domain/entities/Loan";

export class InMemoryLoanRepository implements LoanRepository {
  private readonly store = new Map<string, Loan>();

  async save(loan: Loan): Promise<void> {
    this.store.set(loan.id, loan);
  }

  async findById(id: string): Promise<Loan | null> {
    return this.store.get(id) ?? null;
  }

  async findActiveByBookId(bookId: string): Promise<Loan | null> {
    for (const loan of this.store.values()) {
      if (loan.bookId === bookId && loan.isActive) return loan;
    }
    return null;
  }

  async findByMemberId(memberId: string): Promise<Loan[]> {
    return [...this.store.values()].filter((loan) => loan.memberId === memberId);
  }
}
