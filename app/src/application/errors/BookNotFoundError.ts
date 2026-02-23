import { ApplicationError } from "@application/errors/ApplicationError";

export class BookNotFoundError extends ApplicationError {
  constructor(id: string) {
    super(`Book "${id}" not found`);
  }
}
