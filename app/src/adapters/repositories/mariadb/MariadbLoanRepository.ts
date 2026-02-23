import type { LoanRepository } from "@application/ports/outputs/LoanRepository";
import { Loan } from "@domain/entities/Loan";
import type { Pool, RowDataPacket } from "mysql2/promise";

interface LoanRow extends RowDataPacket {
  id: string;
  book_id: string;
  member_id: string;
  borrowed_at: Date;
  returned_at: Date | null;
}

export class MariadbLoanRepository implements LoanRepository {
  constructor(private readonly pool: Pool) {}

  async save(loan: Loan): Promise<void> {
    await this.pool.execute(
      `INSERT INTO loans (id, book_id, member_id, borrowed_at, returned_at)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE returned_at = VALUES(returned_at)`,
      [loan.id, loan.bookId, loan.memberId, loan.borrowedAt, loan.returnedAt ?? null],
    );
  }

  async findById(id: string): Promise<Loan | null> {
    const [rows] = await this.pool.execute<LoanRow[]>(
      "SELECT id, book_id, member_id, borrowed_at, returned_at FROM loans WHERE id = ?",
      [id],
    );
    return rows[0] ? this.toEntity(rows[0]) : null;
  }

  async findActiveByBookId(bookId: string): Promise<Loan | null> {
    const [rows] = await this.pool.execute<LoanRow[]>(
      "SELECT id, book_id, member_id, borrowed_at, returned_at FROM loans WHERE book_id = ? AND returned_at IS NULL",
      [bookId],
    );
    return rows[0] ? this.toEntity(rows[0]) : null;
  }

  async findByMemberId(memberId: string): Promise<Loan[]> {
    const [rows] = await this.pool.execute<LoanRow[]>(
      "SELECT id, book_id, member_id, borrowed_at, returned_at FROM loans WHERE member_id = ?",
      [memberId],
    );
    return rows.map((row) => this.toEntity(row));
  }

  private toEntity(row: LoanRow): Loan {
    return new Loan(
      row.id,
      row.book_id,
      row.member_id,
      new Date(row.borrowed_at),
      row.returned_at ? new Date(row.returned_at) : undefined,
    );
  }
}
