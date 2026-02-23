import type { Member } from "@domain/entities/Member";

export interface MemberRepository {
  save(member: Member): Promise<void>;
  findById(id: string): Promise<Member | null>;
}
