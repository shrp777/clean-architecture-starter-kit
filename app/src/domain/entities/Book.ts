import { InvalidTitleError } from "@domain/errors/InvalidTitleError";
import { InvalidAuthorError } from "@domain/errors/InvalidAuthorError";
import { Isbn } from "@domain/value-objects/Isbn";

export class Book {
  public readonly id: string;
  public readonly title: string;
  public readonly author: string;
  public readonly isbn?: Isbn;

  constructor(id: string, title: string, author: string, isbn?: string) {
    const normalizedTitle = title.trim();
    const normalizedAuthor = author.trim();
    if (!normalizedTitle) throw new InvalidTitleError();
    if (!normalizedAuthor) throw new InvalidAuthorError();
    this.id = id;
    this.title = normalizedTitle;
    this.author = normalizedAuthor;
    this.isbn = isbn ? new Isbn(isbn) : undefined;
  }
}
