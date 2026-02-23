import { DomainError } from "@domain/errors/DomainError";

export class InvalidEmailError extends DomainError {
  constructor(email: string) {
    super(`Invalid email address: "${email}"`);
  }
}
