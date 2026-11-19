import { initCharts } from "./charts.ts";
import { initDrawings } from "./drawings.ts";
import { refreshLiveFigures } from "./live-figures.ts";
import { initMenu } from "./menu.ts";
import { initNumerals } from "./numerals.ts";
import { initSheets } from "./sheets.ts";

initMenu();
initNumerals();
initDrawings();
initSheets();
initCharts();

for (const button of document.querySelectorAll<HTMLButtonElement>("[data-print]")) {
  button.addEventListener("click", () => window.print());
}

// Live GitHub figures refresh once the page is idle; the build-time values stay if it fails.
const idle = window.requestIdleCallback ?? ((callback: () => void) => window.setTimeout(callback, 400));
idle(() => void refreshLiveFigures());

// Development only: B reveals which file and field fills each blank.
if (import.meta.env.DEV) {
  document.addEventListener("keydown", (event) => {
    const target = event.target as HTMLElement | null;
    if (event.key.toLowerCase() !== "b" || event.metaKey || event.ctrlKey || event.altKey) return;
    if (target?.closest("input, textarea, [contenteditable]")) return;
    document.documentElement.classList.toggle("author-mode");
  });
}
