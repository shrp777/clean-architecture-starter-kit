import type { BookRepository } from "@application/ports/outputs/BookRepository";
import { BookPresenter } from "@adapters/presenters/BookPresenter";
import { AddBookUseCase } from "@application/use-cases/AddBookUseCase";
import { AddBookHandler } from "@adapters/handlers/books/AddBookHandler";

export function createServer(bookRepository: BookRepository) {
  const bookPresenter = new BookPresenter();

  const addBook = new AddBookHandler(
    new AddBookUseCase(bookRepository),
    bookPresenter
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
              books: {
                "POST /api/books": "Add a book"
              }
            }
          })
      },
      "/api/health": {
        GET: () =>
          Response.json({ status: "ok", timestamp: new Date().toISOString() })
      },
      "/api/books": {
        POST: (req) => addBook.handle(req)
      }
    },
    fetch() {
      return new Response("Not found", { status: 404 });
    }
  });
}
