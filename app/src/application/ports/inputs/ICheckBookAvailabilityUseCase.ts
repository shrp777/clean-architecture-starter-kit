export interface ICheckBookAvailabilityUseCase {
  execute(bookId: string): Promise<{ available: boolean }>;
}
