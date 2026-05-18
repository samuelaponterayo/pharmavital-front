import {
  Temporal,
  toZonedDateTime,
  toPlainDate,
  today,
  type TemporalInstant,
  type TemporalZonedDateTime,
} from "./temporal";

type DateInput = string | number | Date | TemporalInstant | TemporalZonedDateTime;

const DATE_FMT: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "America/Bogota",
};

const DATETIME_FMT: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Bogota",
};

export const formatDate = (value: DateInput): string => {
  const zdt = toZonedDateTime(value);
  return new Intl.DateTimeFormat("es-CO", DATE_FMT).format(
    new Date(zdt.epochMilliseconds)
  );
};

export const formatDateTime = (value: DateInput): string => {
  const zdt = toZonedDateTime(value);
  return new Intl.DateTimeFormat("es-CO", DATETIME_FMT).format(
    new Date(zdt.epochMilliseconds)
  );
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("es-CO").format(num);
};

export const daysUntil = (value: DateInput): number => {
  const target = toPlainDate(value);
  return today().until(target).days;
};

export const isExpired = (value: DateInput): boolean => {
  const target = toPlainDate(value);
  return Temporal.PlainDate.compare(today(), target) > 0;
};
