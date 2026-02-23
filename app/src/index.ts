import type { MemberRepository } from "@application/ports/outputs/MemberRepository";
import type { BookRepository } from "@application/ports/outputs/BookRepository";
import type { LoanRepository } from "@application/ports/outputs/LoanRepository";
import { InMemoryMemberRepository } from "@adapters/repositories/in-memory/InMemoryMemberRepository";
import { InMemoryBookRepository } from "@adapters/repositories/in-memory/InMemoryBookRepository";
import { InMemoryLoanRepository } from "@adapters/repositories/in-memory/InMemoryLoanRepository";
import { MariadbMemberRepository } from "@adapters/repositories/mariadb/MariadbMemberRepository";
import { MariadbBookRepository } from "@adapters/repositories/mariadb/MariadbBookRepository";
import { MariadbLoanRepository } from "@adapters/repositories/mariadb/MariadbLoanRepository";
import { MongoMemberRepository } from "@adapters/repositories/mongodb/MongoMemberRepository";
import { MongoBookRepository } from "@adapters/repositories/mongodb/MongoBookRepository";
import { MongoLoanRepository } from "@adapters/repositories/mongodb/MongoLoanRepository";
import { createMongoDb } from "@adapters/repositories/mongodb/createMongoDb";
import { MemberPresenter } from "@adapters/presenters/MemberPresenter";
import { BookPresenter } from "@adapters/presenters/BookPresenter";
import { LoanPresenter } from "@adapters/presenters/LoanPresenter";
import { CreateMemberUseCase } from "@application/use-cases/CreateMemberUseCase";
import { GetMemberUseCase } from "@application/use-cases/GetMemberUseCase";
import { AddBookUseCase } from "@application/use-cases/AddBookUseCase";
import { CheckBookAvailabilityUseCase } from "@application/use-cases/CheckBookAvailabilityUseCase";
import { BorrowBookUseCase } from "@application/use-cases/BorrowBookUseCase";
import { ReturnBookUseCase } from "@application/use-cases/ReturnBookUseCase";
import { GetMemberLoansUseCase } from "@application/use-cases/GetMemberLoansUseCase";
import { ReplDriver } from "@drivers/repl/ReplDriver";
import { createServer } from "@drivers/http/server";
import type { PersistenceType } from "@drivers/PersistenceType";
import type { DriverType } from "@drivers/DriverType";
import { createMariadbPool } from "@adapters/repositories/mariadb/createMariaDBPool";
import type { Pool } from "mysql2/promise";

// Composition root: select repository from PERSISTENCE_TYPE env var
let memberRepository: MemberRepository;
let bookRepository: BookRepository;
let loanRepository: LoanRepository;

const persistenceType: PersistenceType = process.env
  .PERSISTENCE_TYPE as PersistenceType;
const driverType: DriverType = process.env.DRIVER_TYPE as DriverType;

switch (persistenceType) {
  case "mariadb": {
    const pool: Pool = createMariadbPool();
    memberRepository = new MariadbMemberRepository(pool);
    bookRepository = new MariadbBookRepository(pool);
    loanRepository = new MariadbLoanRepository(pool);
    break;
  }
  case "mongodb": {
    const db = await createMongoDb();
    memberRepository = new MongoMemberRepository(db);
    bookRepository = new MongoBookRepository(db);
    loanRepository = new MongoLoanRepository(db);
    break;
  }
  default:
    memberRepository = new InMemoryMemberRepository();
    bookRepository = new InMemoryBookRepository();
    loanRepository = new InMemoryLoanRepository();
}

if (driverType === "repl") {
  const repl = new ReplDriver(
    new CreateMemberUseCase(memberRepository),
    new GetMemberUseCase(memberRepository),
    new AddBookUseCase(bookRepository),
    new CheckBookAvailabilityUseCase(bookRepository, loanRepository),
    new BorrowBookUseCase(bookRepository, loanRepository),
    new ReturnBookUseCase(loanRepository),
    new GetMemberLoansUseCase(loanRepository),
    new MemberPresenter(),
    new BookPresenter(),
    new LoanPresenter()
  );
  await repl.start();
} else {
  const server = createServer(memberRepository, bookRepository, loanRepository);
  console.log(`Server running at http://localhost:${server.port}`);
}
