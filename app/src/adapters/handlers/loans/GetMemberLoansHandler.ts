import type { IGetMemberLoansUseCase } from "@application/ports/inputs/IGetMemberLoansUseCase";
import type { LoanPresenter } from "@adapters/presenters/LoanPresenter";

export class GetMemberLoansHandler {
  constructor(
    private readonly getMemberLoans: IGetMemberLoansUseCase,
    private readonly presenter: LoanPresenter
  ) {}

  async handle(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const memberId = url.searchParams.get("memberId");

    if (!memberId) {
      return Response.json(
        { error: "memberId query parameter is required" },
        { status: 400 }
      );
    }

    const results = await this.getMemberLoans.execute(memberId);
    return this.presenter.toArrayResponse(results);
  }
}
