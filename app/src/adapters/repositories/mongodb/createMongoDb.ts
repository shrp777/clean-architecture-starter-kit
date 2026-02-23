import { MongoClient, type Db } from "mongodb";

export async function createMongoDb(): Promise<Db> {
  const host = process.env.DB_HOST!;
  const port = process.env.DB_PORT ?? "27017";
  const user = process.env.DB_USER!;
  const password = process.env.DB_PASSWORD!;
  const dbName = process.env.DB_NAME!;

  const url = `mongodb://${user}:${password}@${host}:${port}/?authSource=${dbName}`;

  const client = new MongoClient(url);
  await client.connect();

  return client.db(dbName);
}
