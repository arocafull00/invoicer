/**
 * Formatea una fecha en formato "Month DD, YYYY"
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Formatea una moneda en formato "X,XXX.XX€"
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount) + '€';
};

/**
 * Genera un número de factura incremental
 */
export const generateInvoiceNumber = (): string => {
  // En un entorno real, esto vendría de la base de datos
  const sequence = Math.floor(Math.random() * 100) + 1;
  return `INVOICE № ${sequence}`;
};

/**
 * Valida si un email es válido
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Capitaliza la primera letra de una cadena
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export function countWeekdaysInMonth(year: number, month1to12: number): number {
  if (
    !Number.isFinite(year) ||
    month1to12 < 1 ||
    month1to12 > 12
  ) {
    return 0;
  }
  const monthIndex = month1to12 - 1;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  let count = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const dow = new Date(year, monthIndex, day).getDay();
    if (dow === 0 || dow === 6) continue;
    count++;
  }
  return count;
}

const ISO_DATE_PARTS_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function getWeekdayCountFromInvoiceIssueDate(isoDate: string): number | null {
  const match = isoDate.trim().match(ISO_DATE_PARTS_RE);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    month < 1 ||
    month > 12
  ) {
    return null;
  }
  return countWeekdaysInMonth(year, month);
}