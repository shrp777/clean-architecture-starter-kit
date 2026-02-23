import { select, input, Separator } from "@inquirer/prompts";
import type { IAddBookUseCase } from "@application/ports/inputs/IAddBookUseCase";
import type { BookPresenter } from "@adapters/presenters/BookPresenter";

export class ReplDriver {
  constructor(
    private readonly addBook: IAddBookUseCase,
    private readonly bookPresenter: BookPresenter,
  ) {}

  async start(): Promise<void> {
    console.log("Library REPL");

    while (true) {
      const action = await select({
        message: "Action",
        choices: [
          new Separator("── Books ──"),
          { name: "Add a book", value: "add-book" },
          new Separator(),
          { name: "Exit", value: "exit" },
        ],
      });

      if (action === "exit") {
        console.log("Bye!");
        process.exit(0);
      }

      try {
        await this.dispatch(action);
      } catch (err) {
        console.error("Error:", err instanceof Error ? err.message : err);
      }
    }
  }

  private async dispatch(action: string): Promise<void> {
    switch (action) {
      case "add-book": {
        const title  = await input({ message: "Title" });
        const author = await input({ message: "Author" });
        const isbnRaw = await input({ message: "ISBN (optional)" });
        const isbn = isbnRaw.trim() || undefined;
        const book = await this.addBook.execute({ title, author, isbn });
        console.log("Added:", this.bookPresenter.present(book));
        break;
      }
    }
  }
}
