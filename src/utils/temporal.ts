import { Temporal as TemporalNs } from "@js-temporal/polyfill";

export type TemporalInstant = TemporalNs.Instant;
export type TemporalZonedDateTime = TemporalNs.ZonedDateTime;
export type TemporalPlainDate = TemporalNs.PlainDate;
export type TemporalPlainDateTime = TemporalNs.PlainDateTime;
export type TemporalDuration = TemporalNs.Duration;

export { TemporalNs as Temporal };

const TIMEZONE = "America/Bogota";

export const toZonedDateTime = (
  value: string | number | Date | TemporalNs.Instant | TemporalNs.ZonedDateTime
): TemporalNs.ZonedDateTime => {
  if (value instanceof TemporalNs.ZonedDateTime) return value;
  if (value instanceof TemporalNs.Instant) {
    return value.toZonedDateTimeISO(TIMEZONE);
  }
  if (value instanceof Date) {
    return TemporalNs.Instant.fromEpochMilliseconds(
      value.getTime()
    ).toZonedDateTimeISO(TIMEZONE);
  }
  if (typeof value === "number") {
    return TemporalNs.Instant.fromEpochMilliseconds(
      value
    ).toZonedDateTimeISO(TIMEZONE);
  }
  const str = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const plain = TemporalNs.PlainDate.from(str);
    return plain.toZonedDateTime(TIMEZONE);
  }
  const instant = TemporalNs.Instant.from(str);
  return instant.toZonedDateTimeISO(TIMEZONE);
};

export const toPlainDate = (
  value: string | number | Date | TemporalNs.Instant | TemporalNs.ZonedDateTime
): TemporalNs.PlainDate => {
  return toZonedDateTime(value).toPlainDate();
};

export const now = (): TemporalNs.ZonedDateTime => {
  return TemporalNs.Now.zonedDateTimeISO(TIMEZONE);
};

export const today = (): TemporalNs.PlainDate => {
  return TemporalNs.Now.plainDateISO(TIMEZONE);
};
