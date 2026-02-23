import type { MemberRepository } from "@application/ports/outputs/MemberRepository";
import type { Member } from "@domain/entities/Member";

export class InMemoryMemberRepository implements MemberRepository {
  private readonly store = new Map<string, Member>();

  async save(member: Member): Promise<void> {
    this.store.set(member.id, member);
  }

  async findById(id: string): Promise<Member | null> {
    return this.store.get(id) ?? null;
  }
}
