import type { IReturnBookUseCase } from "@application/ports/inputs/IReturnBookUseCase";
import { DomainError } from "@domain/errors/DomainError";
import { LoanNotFoundError } from "@application/errors/LoanNotFoundError";
import type { LoanPresenter } from "@adapters/presenters/LoanPresenter";

export class ReturnBookHandler {
  constructor(
    private readonly returnBook: IReturnBookUseCase,
    private readonly presenter: LoanPresenter
  ) {}

  async handle(loanId: string): Promise<Response> {
    try {
      const result = await this.returnBook.execute(loanId);
      return this.presenter.toResponse(result);
    } catch (err) {
      if (err instanceof LoanNotFoundError) {
        return Response.json({ error: err.message }, { status: 404 });
      }
      if (err instanceof DomainError) {
        return Response.json({ error: err.message }, { status: 422 });
      }
      throw err;
    }
  }
}
