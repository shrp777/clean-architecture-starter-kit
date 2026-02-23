export interface LoanResponseDTO {
  id: string;
  bookId: string;
  memberId: string;
  borrowedAt: string;
  returnedAt?: string;
}
