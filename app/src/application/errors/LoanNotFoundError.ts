import { ApplicationError } from "@application/errors/ApplicationError";

export class LoanNotFoundError extends ApplicationError {
  constructor(id: string) {
    super(`Loan "${id}" not found`);
  }
}
