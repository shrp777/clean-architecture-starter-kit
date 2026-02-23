import type { ICheckBookAvailabilityUseCase } from "@application/ports/inputs/ICheckBookAvailabilityUseCase";
import { BookNotFoundError } from "@application/errors/BookNotFoundError";

export class CheckBookAvailabilityHandler {
  constructor(
    private readonly checkAvailability: ICheckBookAvailabilityUseCase
  ) {}

  async handle(bookId: string): Promise<Response> {
    try {
      const result = await this.checkAvailability.execute(bookId);
      return Response.json(result);
    } catch (err) {
      if (err instanceof BookNotFoundError) {
        return Response.json({ error: err.message }, { status: 404 });
      }
      throw err;
    }
  }
}
