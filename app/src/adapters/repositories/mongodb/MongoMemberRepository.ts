import type { Db } from "mongodb";
import type { MemberRepository } from "@application/ports/outputs/MemberRepository";
import { Member } from "@domain/entities/Member";

interface MemberDocument {
  _id: string;
  name: string;
  email: string;
}

export class MongoMemberRepository implements MemberRepository {
  private readonly collection;

  constructor(db: Db) {
    this.collection = db.collection<MemberDocument>("members");
  }

  async save(member: Member): Promise<void> {
    await this.collection.insertOne({
      _id: member.id,
      name: member.name,
      email: member.email
    });
  }

  async findById(id: string): Promise<Member | null> {
    const doc = await this.collection.findOne({ _id: id });
    if (!doc) return null;
    return new Member(doc._id, doc.name, doc.email);
  }
}

