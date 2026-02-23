import type { Db } from "mongodb";
import type { LoanRepository } from "@application/ports/outputs/LoanRepository";
import { Loan } from "@domain/entities/Loan";

interface LoanDocument {
  _id: string;
  bookId: string;
  memberId: string;
  borrowedAt: Date;
  returnedAt?: Date;
}

export class MongoLoanRepository implements LoanRepository {
  private readonly collection;

  constructor(db: Db) {
    this.collection = db.collection<LoanDocument>("loans");
  }

  async save(loan: Loan): Promise<void> {
    const doc: LoanDocument = {
      _id: loan.id,
      bookId: loan.bookId,
      memberId: loan.memberId,
      borrowedAt: loan.borrowedAt,
      ...(loan.returnedAt !== undefined && { returnedAt: loan.returnedAt }),
    };
    await this.collection.replaceOne({ _id: loan.id }, doc, { upsert: true });
  }

  async findById(id: string): Promise<Loan | null> {
    const doc = await this.collection.findOne({ _id: id });
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async findActiveByBookId(bookId: string): Promise<Loan | null> {
    const doc = await this.collection.findOne({ bookId, returnedAt: { $exists: false } });
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async findByMemberId(memberId: string): Promise<Loan[]> {
    const docs = await this.collection.find({ memberId }).toArray();
    return docs.map((doc) => this.toEntity(doc));
  }

  private toEntity(doc: LoanDocument): Loan {
    return new Loan(doc._id, doc.bookId, doc.memberId, doc.borrowedAt, doc.returnedAt);
  }
}
