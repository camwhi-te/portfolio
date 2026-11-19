/** The running head's "Sheet n of N" follows the reader through the page's sheets. */

export function initSheets() {
  const output = document.querySelector<HTMLOutputElement>("[data-sheet-current]");
  const sheets = [...document.querySelectorAll<HTMLElement>("[data-sheet]")];
  if (!output || sheets.length === 0) return;

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
