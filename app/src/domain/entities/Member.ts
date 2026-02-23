import { InvalidNameError } from "@domain/errors/InvalidNameError";
import { InvalidEmailError } from "@domain/errors/InvalidEmailError";

export class Member {
  public readonly id: string;
  public readonly name: string;
  public readonly email: string;

  constructor(id: string, name: string, email: string) {
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedName) throw new InvalidNameError();
    if (!normalizedEmail.includes("@")) throw new InvalidEmailError(email);
    this.id = id;
    this.name = normalizedName;
    this.email = normalizedEmail;
  }
}
