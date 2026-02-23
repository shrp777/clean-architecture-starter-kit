import { DomainError } from "@domain/errors/DomainError";

export class InvalidTitleError extends DomainError {
  constructor() {
    super("Title cannot be empty");
  }
}
