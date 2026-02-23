import { DomainError } from "@domain/errors/DomainError";

export class InvalidNameError extends DomainError {
  constructor() {
    super("Name cannot be empty");
  }
}
