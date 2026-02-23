import type { BookResponseDTO } from "@application/dtos/book/BookResponseDTO";
import type { BookView } from "@adapters/presenters/BookView";

export class BookPresenter {
  present(dto: BookResponseDTO): BookView {
    return { id: dto.id, title: dto.title, author: dto.author, isbn: dto.isbn };
  }

  toResponse(dto: BookResponseDTO, status = 200): Response {
    return Response.json(this.present(dto), { status });
  }
}
