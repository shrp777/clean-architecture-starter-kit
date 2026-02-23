import type { IGetMemberUseCase } from "@application/ports/inputs/IGetMemberUseCase";
import { MemberNotFoundError } from "@application/errors/MemberNotFoundError";
import type { MemberPresenter } from "@adapters/presenters/MemberPresenter";

export class GetMemberHandler {
  constructor(
    private readonly getMember: IGetMemberUseCase,
    private readonly presenter: MemberPresenter
  ) {}

  async handle(id: string): Promise<Response> {
    try {
      const result = await this.getMember.execute(id);
      return this.presenter.toResponse(result);
    } catch (err) {
      if (err instanceof MemberNotFoundError) {
        return Response.json({ error: err.message }, { status: 404 });
      }
      throw err;
    }
  }
}
