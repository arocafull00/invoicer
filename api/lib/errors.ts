export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number = 500
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function isUniqueViolation(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.message.includes('unique') ||
    error.message.includes('duplicate key')
  );
}

export function getInvoiceSaveErrorMessage(message: string): string {
  if (
    message.includes('invoices_number_key') ||
    message.includes('invoices_number_unique')
  ) {
    return 'No se puede repetir numero de factura';
  }
  return message;
}
