/**
 * On narrow screens the running head folds its sections behind a Menu button.
 * Without this script the sections simply stay visible; data-menu is what lets
 * the stylesheet fold them.
 */

export function initMenu() {
  const head = document.querySelector<HTMLElement>("[data-running-head]");
  const toggle = head?.querySelector<HTMLButtonElement>("[data-menu-toggle]");
  const nav = head?.querySelector<HTMLElement>("#site-nav");
  if (!head || !toggle || !nav) return;

  // The button keeps one name, "Menu"; aria-expanded carries whether it is open,
  // and the filled style shows it.
  const setOpen = (open: boolean) => {
    head.dataset["menu"] = open ? "open" : "closed";
    toggle.setAttribute("aria-expanded", String(open));
  };
  const isOpen = () => head.dataset["menu"] === "open";

  setOpen(false);

  toggle.addEventListener("click", () => setOpen(!isOpen()));

  // Following a link closes the menu, including links to a section of this page.
  nav.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !isOpen()) return;
    setOpen(false);
    toggle.focus();
  });

  // Tabbing out of the running head closes the menu behind you.
  head.addEventListener("focusout", (event) => {
    if (isOpen() && !(event.relatedTarget instanceof Node && head.contains(event.relatedTarget))) setOpen(false);
  });

  document.addEventListener("click", (event) => {
    if (isOpen() && event.target instanceof Node && !head.contains(event.target)) setOpen(false);
  });
}
