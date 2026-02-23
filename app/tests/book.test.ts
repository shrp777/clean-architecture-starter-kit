import { describe, it, expect, beforeEach } from "bun:test";
import { Book } from "@domain/entities/Book";
import { Isbn } from "@domain/value-objects/Isbn";
import { InvalidTitleError } from "@domain/errors/InvalidTitleError";
import { InvalidAuthorError } from "@domain/errors/InvalidAuthorError";
import { InvalidIsbnError } from "@domain/errors/InvalidIsbnError";
import { AddBookUseCase } from "@application/use-cases/AddBookUseCase";
import { InMemoryBookRepository } from "@adapters/repositories/in-memory/InMemoryBookRepository";

// ── Isbn value object ─────────────────────────────────────────────────────────

describe("Isbn value object", () => {
  it("accepts a valid ISBN-13", () => {
    const isbn = new Isbn("978-0-321-12521-7");
    expect(isbn.value).toBe("9780321125217");
  });

  it("accepts a valid ISBN-10", () => {
    const isbn = new Isbn("0-306-40615-2");
    expect(isbn.value).toBe("0306406152");
  });

  it("accepts a valid ISBN-10 with X check digit", () => {
    const isbn = new Isbn("0-19-853453-1");
    expect(isbn.value).toBe("0198534531");
  });

  it("normalizes by stripping hyphens and spaces", () => {
    expect(new Isbn("978-0-321-12521-7").value).toBe(
      new Isbn("9780321125217").value
    );
  });

  it("throws InvalidIsbnError for an arbitrary string", () => {
    expect(() => new Isbn("not-an-isbn")).toThrow(InvalidIsbnError);
  });

  it("throws InvalidIsbnError for a wrong check digit", () => {
    expect(() => new Isbn("9780321125218")).toThrow(InvalidIsbnError);
  });

  it("throws InvalidIsbnError for an empty string", () => {
    expect(() => new Isbn("")).toThrow(InvalidIsbnError);
  });
});

// ── Book entity ───────────────────────────────────────────────────────────────

describe("Book entity", () => {
  it("creates a valid book without isbn", () => {
    const book = new Book("1", "DDD", "Evans");
    expect(book.id).toBe("1");
    expect(book.title).toBe("DDD");
    expect(book.author).toBe("Evans");
    expect(book.isbn).toBeUndefined();
  });

  it("trims title and author", () => {
    const book = new Book("1", "  DDD  ", "  Evans  ");
    expect(book.title).toBe("DDD");
    expect(book.author).toBe("Evans");
  });

  it("creates an Isbn value object from a raw isbn string", () => {
    const book = new Book("1", "DDD", "Evans", "978-0-321-12521-7");
    expect(book.isbn?.value).toBe("9780321125217");
  });

  it("throws InvalidTitleError for empty title", () => {
    expect(() => new Book("1", "", "Evans")).toThrow(InvalidTitleError);
  });

  it("throws InvalidTitleError for whitespace-only title", () => {
    expect(() => new Book("1", "   ", "Evans")).toThrow(InvalidTitleError);
  });

  it("throws InvalidAuthorError for empty author", () => {
    expect(() => new Book("1", "DDD", "")).toThrow(InvalidAuthorError);
  });

  it("throws InvalidAuthorError for whitespace-only author", () => {
    expect(() => new Book("1", "DDD", "   ")).toThrow(InvalidAuthorError);
  });

  it("throws InvalidIsbnError for an invalid isbn string", () => {
    expect(() => new Book("1", "DDD", "Evans", "bad-isbn")).toThrow(
      InvalidIsbnError
    );
  });
});

// ── AddBookUseCase ────────────────────────────────────────────────────────────

describe("AddBookUseCase", () => {
  let bookRepository: InMemoryBookRepository;
  let useCase: AddBookUseCase;

  beforeEach(() => {
    bookRepository = new InMemoryBookRepository();
    useCase = new AddBookUseCase(bookRepository);
  });

  it("adds a book and returns a DTO", async () => {
    const dto = await useCase.execute({ title: "DDD", author: "Evans" });
    expect(dto.id).toBeDefined();
    expect(dto.title).toBe("DDD");
    expect(dto.author).toBe("Evans");
  });

  it("returns the normalized isbn string in the DTO", async () => {
    const dto = await useCase.execute({
      title: "DDD",
      author: "Evans",
      isbn: "978-0-321-12521-7"
    });
    expect(dto.isbn).toBe("9780321125217");
  });

  it("persists the book in repository", async () => {
    const dto = await useCase.execute({ title: "DDD", author: "Evans" });
    const found = await bookRepository.findById(dto.id);
    expect(found).not.toBeNull();
    expect(found!.title).toBe("DDD");
  });

  it("throws InvalidTitleError for empty title", async () => {
    await expect(
      useCase.execute({ title: "", author: "Evans" })
    ).rejects.toThrow(InvalidTitleError);
  });

  it("throws InvalidAuthorError for empty author", async () => {
    await expect(useCase.execute({ title: "DDD", author: "" })).rejects.toThrow(
      InvalidAuthorError
    );
  });

  it("throws InvalidIsbnError for an invalid isbn", async () => {
    await expect(
      useCase.execute({ title: "DDD", author: "Evans", isbn: "bad-isbn" })
    ).rejects.toThrow(InvalidIsbnError);
  });
});
