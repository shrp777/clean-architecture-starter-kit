import type { RowDataPacket } from "mysql2/promise";

export interface BookRow extends RowDataPacket {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
}
