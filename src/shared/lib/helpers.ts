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