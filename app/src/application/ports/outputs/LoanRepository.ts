import type { Loan } from "@domain/entities/Loan";

export interface LoanRepository {
  save(loan: Loan): Promise<void>;
  findById(id: string): Promise<Loan | null>;
  findActiveByBookId(bookId: string): Promise<Loan | null>;
  findByMemberId(memberId: string): Promise<Loan[]>;
}
