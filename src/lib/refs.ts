/**
 * Reference numerals in Cam's own prose.
 *
 * Patent drawings and their text share one index: "the daemon 106 starts each
 * container 108". When Cam writes a part's numeral in a project description,
 * it becomes a live reference automatically. Only numerals that belong to a
 * part drawn on that page are linked, and text inside code, links and
 * preformatted blocks is left alone.
 */

export interface Part {
  n: number | string;
  name: string;
}

const SKIP = new Set(["a", "code", "pre", "script", "style", "kbd", "samp"]);

export function linkNumerals(html: string, parts: Part[]): string {
  const names = new Map(parts.map((part) => [String(part.n), part.name]));
  if (names.size === 0 || !html) return html;
  // Whole numerals only: not inside words, versions, decimals or paths ("v1.106", "2,106", "106/7"),
  // but sentence punctuation after a numeral is fine ("the daemon 106.").
  const alternatives = [...names.keys()].sort((a, b) => b.length - a.length).map(escape).join("|");
  const pattern = new RegExp(`(?<![\\w.,/-])(${alternatives})(?![\\w/]|[.,]\\d)`, "g");
  let skipping = 0;
  return html
    .split(/(<[^>]+>)/g)
    .map((chunk) => {
      if (chunk.startsWith("<")) {
        const tag = /^<\/?\s*([a-z0-9]+)/i.exec(chunk)?.[1]?.toLowerCase();
        if (tag && SKIP.has(tag) && !chunk.endsWith("/>")) skipping += chunk.startsWith("</") ? -1 : 1;
        skipping = Math.max(0, skipping);
        return chunk;
      }
      if (skipping > 0) return chunk;
      return chunk.replace(
        pattern,
        (numeral) =>
          `<a class="ref" href="#ref-${numeral}" data-ref="${numeral}" aria-label="${numeral}, ${attr(names.get(numeral) ?? "")}">${numeral}</a>`,
      );
    })
    .join("");
}

/** Whether rendered Markdown holds any real text yet. */
export const hasText = (html: string | undefined) =>
  !!html && html.replace(/<[^>]+>/g, "").replace(/&nbsp;|\s/g, "").length > 0;

const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const attr = (value: string) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
