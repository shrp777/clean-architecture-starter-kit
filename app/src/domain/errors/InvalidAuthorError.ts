import { DomainError } from "@domain/errors/DomainError";

export class InvalidAuthorError extends DomainError {
  constructor() {
    super("Author cannot be empty");
  }
}
