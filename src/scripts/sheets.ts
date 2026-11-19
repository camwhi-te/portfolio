/**
 * The running head follows the reader down the page: "Sheet n of N" counts the
 * sheets, and on the front page the section being read is marked in the menu.
 */

export function initSheets() {
  const output = document.querySelector<HTMLOutputElement>("[data-sheet-current]");
  const sheets = [...document.querySelectorAll<HTMLElement>("[data-sheet]")];
  if (!output || sheets.length === 0) return;

  // Only the front page holds the sections themselves; on a project page the
  // menu already marks the section that page files under.
  const navLinks = [...document.querySelectorAll<HTMLAnchorElement>("#site-nav a[data-ref]")];
  const spy = location.pathname === "/" && !navLinks.some((link) => link.hasAttribute("aria-current"));
  let here: HTMLAnchorElement | null = null;

  const mark = (sheet: HTMLElement | undefined) => {
    const ref = sheet?.id.startsWith("ref-") ? sheet.id.slice(4) : null;
    const link = navLinks.find((candidate) => candidate.dataset["ref"] === ref) ?? null;
    if (link === here) return;
    here?.classList.remove("is-here");
    here = link;
    here?.classList.add("is-here");
  };

  let queued = false;
  const update = () => {
    queued = false;
    const line = window.innerHeight * 0.35;
    let current = 1;
    sheets.forEach((sheet, index) => {
      if (sheet.getBoundingClientRect().top <= line) current = index + 1;
    });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = sheets.length;
    const value = String(current);
    if (output.value !== value) output.value = value;
    if (spy) mark(sheets[current - 1]);
  };

  window.addEventListener(
    "scroll",
    () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    },
    { passive: true },
  );
  update();
}
