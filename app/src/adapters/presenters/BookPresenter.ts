import type { BookResponseDTO } from "@application/dtos/book/BookResponseDTO";

export interface BookView {
  id: string;
  title: string;
  author: string;
  isbn?: string;
}

export class BookPresenter {
  present(dto: BookResponseDTO): BookView {
    return { id: dto.id, title: dto.title, author: dto.author, isbn: dto.isbn };
  }

  toResponse(dto: BookResponseDTO, status = 200): Response {
    return Response.json(this.present(dto), { status });
  }
}
