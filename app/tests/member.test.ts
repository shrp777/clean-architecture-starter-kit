import { describe, test, expect, beforeEach } from "bun:test";
import { Member } from "@domain/entities/Member";
import { InvalidNameError } from "@domain/errors/InvalidNameError";
import { InvalidEmailError } from "@domain/errors/InvalidEmailError";
import { MemberNotFoundError } from "@application/errors/MemberNotFoundError";
import { InMemoryMemberRepository } from "@adapters/repositories/in-memory/InMemoryMemberRepository";
import { CreateMemberUseCase } from "@application/use-cases/CreateMemberUseCase";
import { GetMemberUseCase } from "@application/use-cases/GetMemberUseCase";

// ── Domain entity ─────────────────────────────────────────────────────────────

describe("Member entity", () => {
  test("creates a valid member", () => {
    const member = new Member("1", "Alice", "alice@example.com");
    expect(member.name).toBe("Alice");
  });

  test("trims whitespace from name and email", () => {
    const member = new Member("1", "  Alice  ", "  alice@example.com  ");
    expect(member.name).toBe("Alice");
    expect(member.email).toBe("alice@example.com");
  });

  test("normalises email to lowercase", () => {
    const member = new Member("1", "Alice", "Alice@Example.COM");
    expect(member.email).toBe("alice@example.com");
  });

  test("throws InvalidNameError for an empty name", () => {
    expect(() => new Member("1", "  ", "alice@example.com")).toThrow(
      InvalidNameError
    );
  });

  test("throws InvalidEmailError for a missing @", () => {
    expect(() => new Member("1", "Alice", "not-an-email")).toThrow(
      InvalidEmailError
    );
  });
});

// ── Use cases ─────────────────────────────────────────────────────────────────

describe("CreateMemberUseCase", () => {
  let repository: InMemoryMemberRepository;
  let createMember: CreateMemberUseCase;

  beforeEach(() => {
    repository = new InMemoryMemberRepository();
    createMember = new CreateMemberUseCase(repository);
  });

  test("returns a DTO with a generated id", async () => {
    const dto = await createMember.execute({
      name: "Alice",
      email: "alice@example.com"
    });
    expect(dto.id).toBeString();
    expect(dto.name).toBe("Alice");
    expect(dto.email).toBe("alice@example.com");
  });

  test("normalises email to lowercase", async () => {
    const dto = await createMember.execute({
      name: "Alice",
      email: "Alice@Example.COM"
    });
    expect(dto.email).toBe("alice@example.com");
  });

  test("persists the member so it can be retrieved", async () => {
    const dto = await createMember.execute({
      name: "Bob",
      email: "bob@example.com"
    });
    const stored = await repository.findById(dto.id);
    expect(stored?.id).toBe(dto.id);
    expect(stored?.name).toBe(dto.name);
    expect(stored?.email).toBe(dto.email);
  });

  test("throws InvalidNameError for an empty name", async () => {
    await expect(
      createMember.execute({ name: "", email: "x@y.com" })
    ).rejects.toThrow(InvalidNameError);
  });

  test("throws InvalidEmailError for a missing @", async () => {
    await expect(
      createMember.execute({ name: "Alice", email: "bad" })
    ).rejects.toThrow(InvalidEmailError);
  });
});

describe("GetMemberUseCase", () => {
  let repository: InMemoryMemberRepository;
  let createMember: CreateMemberUseCase;
  let getMember: GetMemberUseCase;

  beforeEach(() => {
    repository = new InMemoryMemberRepository();
    createMember = new CreateMemberUseCase(repository);
    getMember = new GetMemberUseCase(repository);
  });

  test("throws MemberNotFoundError for an unknown id", async () => {
    await expect(getMember.execute("unknown")).rejects.toThrow(
      MemberNotFoundError
    );
  });

  test("returns a DTO when the member exists", async () => {
    const created = await createMember.execute({
      name: "Alice",
      email: "alice@example.com"
    });
    const found = await getMember.execute(created.id);
    expect(found).toEqual(created);
  });
});
