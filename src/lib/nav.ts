/**
 * The site's sections, in reading order. One list, so the running head, the
 * front-page contents and the page footers all use the same plain labels.
 *
 * Flagship projects open their own page; the rest are sections of the front page.
 */
export interface Section {
  /** Reference numeral; pointing at the link lights the same numeral on the page. */
  n: number;
  label: string;
  href: string;
}

export const sections: Section[] = [
  { n: 100, label: "Jexpanel", href: "/jexpanel/" },
  { n: 200, label: "Falcon Hosting", href: "/falcon-hosting/" },
  { n: 300, label: "Other projects", href: "/#ref-300" },
  { n: 400, label: "Experience", href: "/#ref-400" },
  { n: 500, label: "Contact", href: "/#ref-500" },
];

export const section = (n: number): Section => {
  const found = sections.find((entry) => entry.n === n);
  if (!found) throw new Error(`No section numbered ${n}`);
  return found;
};
