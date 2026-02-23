import type { MemberRepository } from "@application/ports/outputs/MemberRepository";
import { Member } from "@domain/entities/Member";
import type { Pool, RowDataPacket } from "mysql2/promise";

interface MemberRow extends RowDataPacket {
  id: string;
  name: string;
  email: string;
}

export class MariadbMemberRepository implements MemberRepository {
  constructor(private readonly pool: Pool) {}

  async save(member: Member): Promise<void> {
    await this.pool.execute(
      "INSERT INTO members (id, name, email) VALUES (?, ?, ?)",
      [member.id, member.name, member.email]
    );
  }

  async findById(id: string): Promise<Member | null> {
    const [rows] = await this.pool.execute<MemberRow[]>(
      "SELECT id, name, email FROM members WHERE id = ?",
      [id]
    );
    const row = rows[0];
    return row ? new Member(row.id, row.name, row.email) : null;
  }
}
