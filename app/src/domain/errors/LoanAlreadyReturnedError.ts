import { DomainError } from "@domain/errors/DomainError";

export class LoanAlreadyReturnedError extends DomainError {
  constructor() {
    super("Loan has already been returned");
  }
}
