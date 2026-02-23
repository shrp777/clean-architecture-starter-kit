import type { IAddBookUseCase } from "@application/ports/inputs/IAddBookUseCase";
import type { AddBookRequestDTO } from "@application/dtos/book/AddBookRequestDTO";
import { DomainError } from "@domain/errors/DomainError";
import type { BookPresenter } from "@adapters/presenters/BookPresenter";

export class AddBookHandler {
  constructor(
    private readonly addBook: IAddBookUseCase,
    private readonly presenter: BookPresenter
  ) {}

  async handle(req: Request): Promise<Response> {
    const body = (await req.json()) as {
      title?: unknown;
      author?: unknown;
      isbn?: unknown;
    };

    if (typeof body.title !== "string" || typeof body.author !== "string") {
      return Response.json(
        { error: "title and author are required strings" },
        { status: 400 }
      );
    }

    const dto: AddBookRequestDTO = {
      title: body.title,
      author: body.author,
      isbn: typeof body.isbn === "string" ? body.isbn : undefined
    };

    try {
      const result = await this.addBook.execute(dto);
      return this.presenter.toResponse(result, 201);
    } catch (err) {
      if (err instanceof DomainError) {
        return Response.json({ error: err.message }, { status: 422 });
      }
      throw err;
    }
  }
}
