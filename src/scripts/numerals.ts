/**
 * Live reference numerals. Pointing at, focusing or following any element
 * with data-ref="104" lights every element with the same numeral: the part in
 * the drawing, its entry in the reference signs, and mentions in the text.
 */

const selectorFor = (ref: string) => `[data-ref="${CSS.escape(ref)}"]`;

let lit: string | null = null;
let pinned: string | null = null;

function setLit(ref: string | null) {
  if (ref === lit) return;
  if (lit) for (const element of document.querySelectorAll(selectorFor(lit))) element.classList.remove("is-lit");
  lit = ref;
  if (lit) for (const element of document.querySelectorAll(selectorFor(lit))) element.classList.add("is-lit");
}

const refOf = (target: EventTarget | null) =>
  target instanceof Element ? (target.closest<HTMLElement | SVGElement>("[data-ref]")?.dataset["ref"] ?? null) : null;

function pinFromHash() {
  const match = /^#ref-(.+)$/.exec(decodeURIComponent(location.hash));
  pinned = match?.[1] ?? null;
  setLit(pinned);
}

export function initNumerals() {
  document.addEventListener("pointerover", (event) => setLit(refOf(event.target) ?? pinned));
  document.addEventListener("focusin", (event) => setLit(refOf(event.target) ?? pinned));
  document.addEventListener("focusout", () => setLit(pinned));

  // A part in a drawing is not a link itself; following it goes to its reference sign.
  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const part = target?.closest<SVGGElement>(".drawing .part[data-ref]");
    if (!part) return;
    const ref = part.dataset["ref"];
    if (!ref) return;
    if (document.getElementById(`ref-${ref}`)) {
      location.hash = `ref-${ref}`;
      return;
    }
    const link = document.querySelector<HTMLAnchorElement>(`a.ref${selectorFor(ref)}`);
    if (link) link.click();
  });

  window.addEventListener("hashchange", pinFromHash);
  pinFromHash();
}
