import { ApplicationError } from "@application/errors/ApplicationError";

export class BookAlreadyBorrowedError extends ApplicationError {
  constructor(bookId: string) {
    super(`Book "${bookId}" is already borrowed`);
  }
}
