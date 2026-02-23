import { describe, it, expect, beforeEach } from "bun:test";
import { Loan } from "@domain/entities/Loan";
import { LoanAlreadyReturnedError } from "@domain/errors/LoanAlreadyReturnedError";
import { BorrowBookUseCase } from "@application/use-cases/BorrowBookUseCase";
import { ReturnBookUseCase } from "@application/use-cases/ReturnBookUseCase";
import { GetMemberLoansUseCase } from "@application/use-cases/GetMemberLoansUseCase";
import { BookNotFoundError } from "@application/errors/BookNotFoundError";
import { LoanNotFoundError } from "@application/errors/LoanNotFoundError";
import { BookAlreadyBorrowedError } from "@application/errors/BookAlreadyBorrowedError";
import { InMemoryBookRepository } from "@adapters/repositories/in-memory/InMemoryBookRepository";
import { InMemoryLoanRepository } from "@adapters/repositories/in-memory/InMemoryLoanRepository";
import { Book } from "@domain/entities/Book";

describe("Loan entity", () => {
  const now = new Date();

  it("creates an active loan", () => {
    const loan = new Loan("l1", "b1", "m1", now);
    expect(loan.isActive).toBe(true);
    expect(loan.returnedAt).toBeUndefined();
  });

  it("creates an inactive loan (already returned)", () => {
    const returned = new Date();
    const loan = new Loan("l1", "b1", "m1", now, returned);
    expect(loan.isActive).toBe(false);
    expect(loan.returnedAt).toBe(returned);
  });

  it("return() creates a new Loan with returnedAt set", () => {
    const loan = new Loan("l1", "b1", "m1", now);
    const returned = loan.giveBack();
    expect(returned).not.toBe(loan);
    expect(returned.id).toBe(loan.id);
    expect(returned.returnedAt).toBeDefined();
    expect(returned.isActive).toBe(false);
    expect(loan.isActive).toBe(true); // original unchanged
  });

  it("return() throws LoanAlreadyReturnedError on already returned loan", () => {
    const loan = new Loan("l1", "b1", "m1", now, new Date());
    expect(() => loan.giveBack()).toThrow(LoanAlreadyReturnedError);
  });
});

describe("BorrowBookUseCase", () => {
  let bookRepository: InMemoryBookRepository;
  let loanRepository: InMemoryLoanRepository;
  let useCase: BorrowBookUseCase;

  beforeEach(() => {
    bookRepository = new InMemoryBookRepository();
    loanRepository = new InMemoryLoanRepository();
    useCase = new BorrowBookUseCase(bookRepository, loanRepository);
  });

  it("throws BookNotFoundError when book does not exist", async () => {
    await expect(
      useCase.execute({ bookId: "unknown", memberId: "m1" })
    ).rejects.toThrow(BookNotFoundError);
  });

  it("creates a loan and returns a DTO", async () => {
    await bookRepository.save(new Book("b1", "DDD", "Evans"));
    const dto = await useCase.execute({ bookId: "b1", memberId: "m1" });
    expect(dto.id).toBeDefined();
    expect(dto.bookId).toBe("b1");
    expect(dto.memberId).toBe("m1");
    expect(dto.borrowedAt).toBeDefined();
    expect(dto.returnedAt).toBeUndefined();
  });

  it("throws BookAlreadyBorrowedError when book is already borrowed", async () => {
    await bookRepository.save(new Book("b1", "DDD", "Evans"));
    await useCase.execute({ bookId: "b1", memberId: "m1" });
    await expect(
      useCase.execute({ bookId: "b1", memberId: "m2" })
    ).rejects.toThrow(BookAlreadyBorrowedError);
  });
});

describe("ReturnBookUseCase", () => {
  let bookRepository: InMemoryBookRepository;
  let loanRepository: InMemoryLoanRepository;
  let returnUseCase: ReturnBookUseCase;
  let borrowUseCase: BorrowBookUseCase;

  beforeEach(() => {
    bookRepository = new InMemoryBookRepository();
    loanRepository = new InMemoryLoanRepository();
    returnUseCase = new ReturnBookUseCase(loanRepository);
    borrowUseCase = new BorrowBookUseCase(bookRepository, loanRepository);
  });

  it("throws LoanNotFoundError when loan does not exist", async () => {
    await expect(returnUseCase.execute("unknown")).rejects.toThrow(
      LoanNotFoundError
    );
  });

  it("returns the book and updates returnedAt", async () => {
    await bookRepository.save(new Book("b1", "DDD", "Evans"));
    const borrowed = await borrowUseCase.execute({
      bookId: "b1",
      memberId: "m1"
    });
    const returned = await returnUseCase.execute(borrowed.id);
    expect(returned.returnedAt).toBeDefined();
    expect(returned.id).toBe(borrowed.id);
  });

  it("throws LoanAlreadyReturnedError when loan is already returned", async () => {
    await bookRepository.save(new Book("b1", "DDD", "Evans"));
    const borrowed = await borrowUseCase.execute({
      bookId: "b1",
      memberId: "m1"
    });
    await returnUseCase.execute(borrowed.id);
    await expect(returnUseCase.execute(borrowed.id)).rejects.toThrow(
      LoanAlreadyReturnedError
    );
  });
});

describe("GetMemberLoansUseCase", () => {
  let bookRepository: InMemoryBookRepository;
  let loanRepository: InMemoryLoanRepository;
  let useCase: GetMemberLoansUseCase;
  let borrowUseCase: BorrowBookUseCase;

  beforeEach(() => {
    bookRepository = new InMemoryBookRepository();
    loanRepository = new InMemoryLoanRepository();
    useCase = new GetMemberLoansUseCase(loanRepository);
    borrowUseCase = new BorrowBookUseCase(bookRepository, loanRepository);
  });

  it("returns empty array when member has no loans", async () => {
    const loans = await useCase.execute("m1");
    expect(loans).toEqual([]);
  });

  it("returns all loans for a member", async () => {
    await bookRepository.save(new Book("b1", "DDD", "Evans"));
    await bookRepository.save(new Book("b2", "Clean Architecture", "Martin"));
    await borrowUseCase.execute({ bookId: "b1", memberId: "m1" });
    await borrowUseCase.execute({ bookId: "b2", memberId: "m1" });
    const loans = await useCase.execute("m1");
    expect(loans).toHaveLength(2);
  });

  it("does not return loans for other members", async () => {
    await bookRepository.save(new Book("b1", "DDD", "Evans"));
    await borrowUseCase.execute({ bookId: "b1", memberId: "m2" });
    const loans = await useCase.execute("m1");
    expect(loans).toEqual([]);
  });
});
