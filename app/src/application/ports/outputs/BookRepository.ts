import type { Book } from "@domain/entities/Book";

export interface BookRepository {
  save(book: Book): Promise<void>;
  findById(id: string): Promise<Book | null>;
}
