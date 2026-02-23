import type { AddBookRequestDTO } from "@application/dtos/book/AddBookRequestDTO";
import type { BookResponseDTO } from "@application/dtos/book/BookResponseDTO";

export interface IAddBookUseCase {
  execute(dto: AddBookRequestDTO): Promise<BookResponseDTO>;
}
