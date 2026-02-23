import type { BookRepository } from "@application/ports/outputs/BookRepository";
import { InMemoryBookRepository } from "@adapters/repositories/in-memory/InMemoryBookRepository";
import { MariadbBookRepository } from "@adapters/repositories/mariadb/MariadbBookRepository";
import { MongoBookRepository } from "@adapters/repositories/mongodb/MongoBookRepository";
import { BookPresenter } from "@adapters/presenters/BookPresenter";
import { AddBookUseCase } from "@application/use-cases/AddBookUseCase";
import { ReplDriver } from "@drivers/repl/ReplDriver";
import { createServer } from "@drivers/http/server";
import type { PersistenceType } from "@drivers/PersistenceType";
import type { DriverType } from "@drivers/DriverType";
import { createMariadbPool } from "@adapters/repositories/mariadb/createMariaDBPool";
import { createMongoDb } from "@adapters/repositories/mongodb/createMongoDb";

let bookRepository: BookRepository;

const persistenceType: PersistenceType = process.env.PERSISTENCE_TYPE as PersistenceType;
const driverType: DriverType = process.env.DRIVER_TYPE as DriverType;

switch (persistenceType) {
  case "mariadb": {
    const pool = createMariadbPool();
    bookRepository = new MariadbBookRepository(pool);
    break;
  }
  case "mongodb": {
    const db = await createMongoDb();
    bookRepository = new MongoBookRepository(db);
    break;
  }
  default:
    bookRepository = new InMemoryBookRepository();
}

if (driverType === "repl") {
  const repl = new ReplDriver(
    new AddBookUseCase(bookRepository),
    new BookPresenter()
  );
  await repl.start();
} else {
  const server = createServer(bookRepository);
  console.log(`Server running at http://localhost:${server.port}`);
}
