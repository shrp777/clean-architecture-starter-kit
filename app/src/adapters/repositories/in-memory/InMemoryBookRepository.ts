import type { BookRepository } from "@application/ports/outputs/BookRepository";
import type { Book } from "@domain/entities/Book";

export class InMemoryBookRepository implements BookRepository {
  private readonly store = new Map<string, Book>();

  async save(book: Book): Promise<void> {
    this.store.set(book.id, book);
  }

  async findById(id: string): Promise<Book | null> {
    return this.store.get(id) ?? null;
  }
}
