import type { Db } from "mongodb";
import type { BookRepository } from "@application/ports/outputs/BookRepository";
import { Book } from "@domain/entities/Book";

interface BookDocument {
  _id: string;
  title: string;
  author: string;
  isbn?: string;
}

export class MongoBookRepository implements BookRepository {
  private readonly collection;

  constructor(db: Db) {
    this.collection = db.collection<BookDocument>("books");
  }

  async save(book: Book): Promise<void> {
    const doc: BookDocument = {
      _id: book.id,
      title: book.title,
      author: book.author,
      ...(book.isbn !== undefined && { isbn: book.isbn.value }),
    };
    await this.collection.insertOne(doc);
  }

  async findById(id: string): Promise<Book | null> {
    const doc = await this.collection.findOne({ _id: id });
    if (!doc) return null;
    return new Book(doc._id, doc.title, doc.author, doc.isbn);
  }
}
