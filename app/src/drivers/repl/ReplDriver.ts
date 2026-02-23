import { select, input, Separator } from "@inquirer/prompts";
import type { ICreateMemberUseCase } from "@application/ports/inputs/ICreateMemberUseCase";
import type { IGetMemberUseCase } from "@application/ports/inputs/IGetMemberUseCase";
import type { IAddBookUseCase } from "@application/ports/inputs/IAddBookUseCase";
import type { ICheckBookAvailabilityUseCase } from "@application/ports/inputs/ICheckBookAvailabilityUseCase";
import type { IBorrowBookUseCase } from "@application/ports/inputs/IBorrowBookUseCase";
import type { IReturnBookUseCase } from "@application/ports/inputs/IReturnBookUseCase";
import type { IGetMemberLoansUseCase } from "@application/ports/inputs/IGetMemberLoansUseCase";
import type { MemberPresenter } from "@adapters/presenters/MemberPresenter";
import type { BookPresenter } from "@adapters/presenters/BookPresenter";
import type { LoanPresenter } from "@adapters/presenters/LoanPresenter";

export class ReplDriver {
  constructor(
    private readonly createMember: ICreateMemberUseCase,
    private readonly getMember: IGetMemberUseCase,
    private readonly addBook: IAddBookUseCase,
    private readonly checkBookAvailability: ICheckBookAvailabilityUseCase,
    private readonly borrowBook: IBorrowBookUseCase,
    private readonly returnBook: IReturnBookUseCase,
    private readonly getMemberLoans: IGetMemberLoansUseCase,
    private readonly memberPresenter: MemberPresenter,
    private readonly bookPresenter: BookPresenter,
    private readonly loanPresenter: LoanPresenter,
  ) {}

  async start(): Promise<void> {
    console.log("Library REPL");

    while (true) {
      const action = await select({
        message: "Action",
        choices: [
          new Separator("── Members ──"),
          { name: "Create a member",         value: "create-member" },
          { name: "Get a member",             value: "get-member" },
          new Separator("── Books ──"),
          { name: "Add a book",               value: "add-book" },
          { name: "Check book availability",  value: "check-availability" },
          new Separator("── Loans ──"),
          { name: "Borrow a book",            value: "borrow-book" },
          { name: "Return a book",            value: "return-book" },
          { name: "Get member loans",         value: "get-loans" },
          new Separator(),
          { name: "Exit",                     value: "exit" },
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
      case "create-member": {
        const name  = await input({ message: "Name" });
        const email = await input({ message: "Email" });
        const member = await this.createMember.execute({ name, email });
        console.log("Created:", this.memberPresenter.present(member));
        break;
      }

      case "get-member": {
        const id = await input({ message: "Member ID" });
        const member = await this.getMember.execute(id);
        console.log(this.memberPresenter.present(member));
        break;
      }

      case "add-book": {
        const title  = await input({ message: "Title" });
        const author = await input({ message: "Author" });
        const isbnRaw = await input({ message: "ISBN (optional)" });
        const isbn = isbnRaw.trim() || undefined;
        const book = await this.addBook.execute({ title, author, isbn });
        console.log("Added:", this.bookPresenter.present(book));
        break;
      }

      case "check-availability": {
        const bookId = await input({ message: "Book ID" });
        const result = await this.checkBookAvailability.execute(bookId);
        console.log("Available:", result.available);
        break;
      }

      case "borrow-book": {
        const bookId   = await input({ message: "Book ID" });
        const memberId = await input({ message: "Member ID" });
        const loan = await this.borrowBook.execute({ bookId, memberId });
        console.log("Loan created:", this.loanPresenter.present(loan));
        break;
      }

      case "return-book": {
        const loanId = await input({ message: "Loan ID" });
        const loan = await this.returnBook.execute(loanId);
        console.log("Returned:", this.loanPresenter.present(loan));
        break;
      }

      case "get-loans": {
        const memberId = await input({ message: "Member ID" });
        const loans = await this.getMemberLoans.execute(memberId);
        if (loans.length === 0) {
          console.log("No loans found.");
        } else {
          loans.forEach((loan) => console.log(this.loanPresenter.present(loan)));
        }
        break;
      }
    }
  }
}
