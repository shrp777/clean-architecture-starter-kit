import type { BookRepository } from "@application/ports/outputs/BookRepository";
import { Book } from "@domain/entities/Book";
import type { Pool } from "mysql2/promise";
import type { BookRow } from "@adapters/repositories/mariadb/BookRow";

export class MariadbBookRepository implements BookRepository {
  constructor(private readonly pool: Pool) {}

  async save(book: Book): Promise<void> {
    await this.pool.execute(
      "INSERT INTO books (id, title, author, isbn) VALUES (?, ?, ?, ?)",
      [book.id, book.title, book.author, book.isbn?.value ?? null]
    );
  }

  async findById(id: string): Promise<Book | null> {
    const [rows] = await this.pool.execute<BookRow[]>(
      "SELECT id, title, author, isbn FROM books WHERE id = ?",
      [id]
    );
    const row = rows[0];
    return row
      ? new Book(row.id, row.title, row.author, row.isbn ?? undefined)
      : null;
  }
}
