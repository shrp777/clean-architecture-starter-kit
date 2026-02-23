import type { IBorrowBookUseCase } from "@application/ports/inputs/IBorrowBookUseCase";
import type { BorrowBookRequestDTO } from "@application/dtos/loan/BorrowBookRequestDTO";
import { BookNotFoundError } from "@application/errors/BookNotFoundError";
import { BookAlreadyBorrowedError } from "@application/errors/BookAlreadyBorrowedError";
import type { LoanPresenter } from "@adapters/presenters/LoanPresenter";

export class BorrowBookHandler {
  constructor(
    private readonly borrowBook: IBorrowBookUseCase,
    private readonly presenter: LoanPresenter
  ) {}

  async handle(req: Request): Promise<Response> {
    const body = (await req.json()) as { bookId?: unknown; memberId?: unknown };

    if (typeof body.bookId !== "string" || typeof body.memberId !== "string") {
      return Response.json(
        { error: "bookId and memberId are required strings" },
        { status: 400 }
      );
    }

    const dto: BorrowBookRequestDTO = {
      bookId: body.bookId,
      memberId: body.memberId
    };

    try {
      const result = await this.borrowBook.execute(dto);
      return this.presenter.toResponse(result, 201);
    } catch (err) {
      if (err instanceof BookNotFoundError) {
        return Response.json({ error: err.message }, { status: 404 });
      }
      if (err instanceof BookAlreadyBorrowedError) {
        return Response.json({ error: err.message }, { status: 409 });
      }
      throw err;
    }
  }
}
