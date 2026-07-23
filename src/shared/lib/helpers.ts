import type { SupportedCurrency, SupportedDateFormat } from '@/shared/types';
import { useSettingsStore } from '@/shared/lib/stores';

const CURRENCY_MAP: Record<SupportedCurrency, { code: string; locale: string }> = {
  eur: { code: 'EUR', locale: 'es-ES' },
  usd: { code: 'USD', locale: 'en-US' },
  gbp: { code: 'GBP', locale: 'en-GB' },
};

function getSettings() {
  return (
    useSettingsStore.getState().settings ?? {
      default_currency: 'eur' as SupportedCurrency,
      date_format: 'dd/mm/yyyy' as SupportedDateFormat,
      pdf_color_palette: 'violet' as const,
    }
  );
}

function parseDateParts(dateString: string): { year: number; month: number; day: number } | null {
  const iso = dateString.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    return {
      year: Number(iso[1]),
      month: Number(iso[2]),
      day: Number(iso[3]),
    };
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;

  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

export const formatDate = (
  dateString: string,
  dateFormat?: SupportedDateFormat
): string => {
  const parts = parseDateParts(dateString);
  if (!parts) return dateString;

  const format = dateFormat ?? getSettings().date_format;
  const dd = String(parts.day).padStart(2, '0');
  const mm = String(parts.month).padStart(2, '0');
  const yyyy = String(parts.year);

  if (format === 'mm/dd/yyyy') return `${mm}/${dd}/${yyyy}`;
  if (format === 'yyyy-mm-dd') return `${yyyy}-${mm}-${dd}`;
  return `${dd}/${mm}/${yyyy}`;
};

export const formatCurrency = (
  amount: number,
  currency?: SupportedCurrency
): string => {
  const selected = currency ?? getSettings().default_currency;
  const { code, locale } = CURRENCY_MAP[selected] ?? CURRENCY_MAP.eur;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
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
