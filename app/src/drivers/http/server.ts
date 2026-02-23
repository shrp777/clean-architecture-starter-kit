import type { MemberRepository } from "@application/ports/outputs/MemberRepository";
import type { BookRepository } from "@application/ports/outputs/BookRepository";
import type { LoanRepository } from "@application/ports/outputs/LoanRepository";

import { MemberPresenter } from "@adapters/presenters/MemberPresenter";
import { BookPresenter } from "@adapters/presenters/BookPresenter";
import { LoanPresenter } from "@adapters/presenters/LoanPresenter";
import { CreateMemberUseCase } from "@application/use-cases/CreateMemberUseCase";
import { GetMemberUseCase } from "@application/use-cases/GetMemberUseCase";
import { AddBookUseCase } from "@application/use-cases/AddBookUseCase";
import { CheckBookAvailabilityUseCase } from "@application/use-cases/CheckBookAvailabilityUseCase";
import { BorrowBookUseCase } from "@application/use-cases/BorrowBookUseCase";
import { ReturnBookUseCase } from "@application/use-cases/ReturnBookUseCase";
import { GetMemberLoansUseCase } from "@application/use-cases/GetMemberLoansUseCase";
import { AddBookHandler } from "@adapters/handlers/books/AddBookHandler";
import { CheckBookAvailabilityHandler } from "@adapters/handlers/books/CheckBookAvailabilityHandler";
import { BorrowBookHandler } from "@adapters/handlers/loans/BorrowBookHandler";
import { GetMemberLoansHandler } from "@adapters/handlers/loans/GetMemberLoansHandler";
import { ReturnBookHandler } from "@adapters/handlers/loans/ReturnBookHandler";
import { CreateMemberHandler } from "@adapters/handlers/members/CreateMemberHandler";
import { GetMemberHandler } from "@adapters/handlers/members/GetMemberHandler";
export function createServer(
  memberRepository: MemberRepository,
  bookRepository: BookRepository,
  loanRepository: LoanRepository
) {
  const memberPresenter = new MemberPresenter();
  const bookPresenter = new BookPresenter();
  const loanPresenter = new LoanPresenter();

  const createMember = new CreateMemberHandler(
    new CreateMemberUseCase(memberRepository),
    memberPresenter
  );
  const getMember = new GetMemberHandler(
    new GetMemberUseCase(memberRepository),
    memberPresenter
  );
  const addBook = new AddBookHandler(
    new AddBookUseCase(bookRepository),
    bookPresenter
  );
  const checkAvailability = new CheckBookAvailabilityHandler(
    new CheckBookAvailabilityUseCase(bookRepository, loanRepository)
  );
  const borrowBook = new BorrowBookHandler(
    new BorrowBookUseCase(bookRepository, loanRepository),
    loanPresenter
  );
  const returnBook = new ReturnBookHandler(
    new ReturnBookUseCase(loanRepository),
    loanPresenter
  );
  const getMemberLoans = new GetMemberLoansHandler(
    new GetMemberLoansUseCase(loanRepository),
    loanPresenter
  );

  return Bun.serve({
    port: 3000,
    routes: {
      "/": {
        GET: () => Response.redirect("/api", 301)
      },
      "/api": {
        GET: () =>
          Response.json({
            message: "Library API",
            endpoints: {
              members: {
                "POST /api/members": "Create a member",
                "GET  /api/members/:id": "Get a member by id"
              },
              books: {
                "POST /api/books": "Add a book",
                "GET  /api/books/:id/availability": "Check book availability"
              },
              loans: {
                "POST  /api/loans": "Borrow a book",
                "GET   /api/loans?memberId=": "Get loans of a member",
                "PATCH /api/loans/:id/return": "Return a book"
              }
            }
          })
      },
      "/api/health": {
        GET: () =>
          Response.json({ status: "ok", timestamp: new Date().toISOString() })
      },
      "/api/members": {
        POST: (req) => createMember.handle(req)
      },
      "/api/members/:id": {
        GET: (req) => getMember.handle(req.params.id)
      },
      "/api/books": {
        POST: (req) => addBook.handle(req)
      },
      "/api/books/:id/availability": {
        GET: (req) => checkAvailability.handle(req.params.id)
      },
      "/api/loans": {
        POST: (req) => borrowBook.handle(req),
        GET: (req) => getMemberLoans.handle(req)
      },
      "/api/loans/:id/return": {
        PATCH: (req) => returnBook.handle(req.params.id)
      }
    },
    fetch() {
      return new Response("Not found", { status: 404 });
    }
  });
}
