import { DomainError } from "@domain/errors/DomainError";

export class InvalidIsbnError extends DomainError {
  constructor(value: string) {
    super(`Invalid ISBN: "${value}"`);
  }
}
