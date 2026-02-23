import { InvalidIsbnError } from "@domain/errors/InvalidIsbnError";

export class Isbn {
  readonly value: string;

  constructor(raw: string) {
    const normalized = raw.replace(/[-\s]/g, "");
    if (!Isbn.isValidIsbn10(normalized) && !Isbn.isValidIsbn13(normalized)) {
      throw new InvalidIsbnError(raw);
    }
    this.value = normalized;
  }

  private static isValidIsbn10(isbn: string): boolean {
    if (!/^\d{9}[\dX]$/.test(isbn)) return false;
    const sum = isbn
      .split("")
      .reduce((acc, char, i) => acc + (char === "X" ? 10 : Number(char)) * (10 - i), 0);
    return sum % 11 === 0;
  }

  private static isValidIsbn13(isbn: string): boolean {
    if (!/^\d{13}$/.test(isbn)) return false;
    const sum = isbn
      .split("")
      .reduce((acc, char, i) => acc + Number(char) * (i % 2 === 0 ? 1 : 3), 0);
    return sum % 10 === 0;
  }

  toString(): string {
    return this.value;
  }
}
