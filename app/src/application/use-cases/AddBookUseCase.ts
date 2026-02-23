import type { IAddBookUseCase } from "@application/ports/inputs/IAddBookUseCase";
import type { BookRepository } from "@application/ports/outputs/BookRepository";
import type { AddBookRequestDTO } from "@application/dtos/book/AddBookRequestDTO";
import type { BookResponseDTO } from "@application/dtos/book/BookResponseDTO";
import { Book } from "@domain/entities/Book";

export class AddBookUseCase implements IAddBookUseCase {
  constructor(private readonly bookRepository: BookRepository) {}

  async execute(dto: AddBookRequestDTO): Promise<BookResponseDTO> {
    const book = new Book(crypto.randomUUID(), dto.title, dto.author, dto.isbn);
    await this.bookRepository.save(book);
    return {
      id: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn?.value
    };
  }
}
