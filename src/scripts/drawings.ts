/**
 * Draw-in: a drawing below the fold is inked once, in a draughtsman's order
 * (outlines, then parts, connections and leaders), when it first comes into
 * view. Drawings already on screen at load either drew themselves through CSS
 * (the first figure) or simply stay as they are. Reduced motion: nothing moves.
 */

export function initDrawings() {
  if (!document.documentElement.classList.contains("motion")) return;
  const drawings = [...document.querySelectorAll<SVGSVGElement>("svg.drawing:not([data-draw])")].filter(
    (svg) => svg.getBoundingClientRect().top > window.innerHeight,
  );
  if (drawings.length === 0 || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const svg = entry.target as SVGSVGElement;
        svg.dataset["draw"] = "run";
        observer.unobserve(svg);
      }
    },
    { rootMargin: "0px 0px -15% 0px", threshold: 0.2 },
  );

  for (const svg of drawings) {
    svg.dataset["draw"] = "armed";
    observer.observe(svg);
  }
}
