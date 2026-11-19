const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const monthFormat = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
const longMonth = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
const stampFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
});
const numberFormat = new Intl.NumberFormat("en-GB");
const ordinalRules = new Intl.PluralRules("en-GB", { type: "ordinal" });
const ordinalSuffix: Record<string, string> = { one: "st", two: "nd", few: "rd", other: "th" };

export const formatDate = (iso: string) => dateFormat.format(new Date(iso));
export const formatMonth = (iso: string) => monthFormat.format(new Date(iso));
export const formatLongMonth = (iso: string) => longMonth.format(new Date(iso));
export const formatStamp = (iso: string) => stampFormat.format(new Date(iso));
export const formatNumber = (value: number) => numberFormat.format(value);
export const ordinal = (value: number) => `${value}${ordinalSuffix[ordinalRules.select(value)] ?? "th"}`;
export const year = (iso: string) => new Date(iso).getUTCFullYear();

/** "PHP 51.6 %, TypeScript 47.7 %" style shares, largest first, dropping slivers. */
export function languageShares(languages: { name: string; bytes: number }[], minimum = 1) {
  const total = languages.reduce((sum, language) => sum + language.bytes, 0);
  if (total === 0) return [];
  return languages
    .map((language) => ({ name: language.name, share: (language.bytes / total) * 100 }))
    .filter((language) => language.share >= minimum);
}

export const percent = (value: number) => `${value >= 10 ? Math.round(value) : value.toFixed(1)} %`;

/** Semantic-version level of a tag, for drawing release stems. */
export function releaseLevel(tag: string, prerelease: boolean): "major" | "minor" | "patch" | "pre" {
  if (prerelease) return "pre";
  const match = /^v?(\d+)\.(\d+)\.(\d+)/.exec(tag);
  if (!match) return "patch";
  if (match[2] === "0" && match[3] === "0") return "major";
  if (match[3] === "0") return "minor";
  return "patch";
}
