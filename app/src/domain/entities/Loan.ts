import { LoanAlreadyReturnedError } from "@domain/errors/LoanAlreadyReturnedError";

export class Loan {
  constructor(
    public readonly id: string,
    public readonly bookId: string,
    public readonly memberId: string,
    public readonly borrowedAt: Date,
    public readonly returnedAt?: Date
  ) {}

  get isActive(): boolean {
    return this.returnedAt === undefined;
  }

  giveBack(): Loan {
    if (!this.isActive) throw new LoanAlreadyReturnedError();
    return new Loan(
      this.id,
      this.bookId,
      this.memberId,
      this.borrowedAt,
      new Date()
    );
  }
}
