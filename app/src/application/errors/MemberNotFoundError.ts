import { ApplicationError } from "@application/errors/ApplicationError";

export class MemberNotFoundError extends ApplicationError {
  constructor(id: string) {
    super(`Member "${id}" not found`);
  }
}
