import type { ICreateMemberUseCase } from "@application/ports/inputs/ICreateMemberUseCase";
import type { CreateMemberRequestDTO } from "@application/dtos/member/CreateMemberRequestDTO";
import { DomainError } from "@domain/errors/DomainError";
import type { MemberPresenter } from "@adapters/presenters/MemberPresenter";

export class CreateMemberHandler {
  constructor(
    private readonly createMember: ICreateMemberUseCase,
    private readonly presenter: MemberPresenter
  ) {}

  async handle(req: Request): Promise<Response> {
    const body = (await req.json()) as { name?: unknown; email?: unknown };

    if (typeof body.name !== "string" || typeof body.email !== "string") {
      return Response.json(
        { error: "name and email are required strings" },
        { status: 400 }
      );
    }

    const dto: CreateMemberRequestDTO = { name: body.name, email: body.email };

    try {
      const result = await this.createMember.execute(dto);
      return this.presenter.toResponse(result, 201);
    } catch (err) {
      if (err instanceof DomainError) {
        return Response.json({ error: err.message }, { status: 422 });
      }
      throw err;
    }
  }
}
