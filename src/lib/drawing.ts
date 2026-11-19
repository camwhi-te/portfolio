/**
 * Geometry for the drawing sheets. Every figure is plain SVG line work built
 * from these few primitives, so labels stay selectable text and each part can
 * be lit by its reference numeral.
 */

const r = (value: number) => Math.round(value * 100) / 100;

/** An open chevron arrowhead with its tip at (x, y), pointing along `angle` degrees. */
export function arrowhead(x: number, y: number, angle: number, size = 7) {
  const a = (angle * Math.PI) / 180;
  const bx = x - Math.cos(a) * size;
  const by = y - Math.sin(a) * size;
  const px = -Math.sin(a) * size * 0.48;
  const py = Math.cos(a) * size * 0.48;
  return `M${r(bx + px)} ${r(by + py)} L${r(x)} ${r(y)} L${r(bx - px)} ${r(by - py)}`;
}

/** A leader line: a shallow curve from a numeral to the part it names. */
export function leader(x1: number, y1: number, x2: number, y2: number, bend = 0.22) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  return `M${r(x1)} ${r(y1)} Q${r(mx - dy * bend)} ${r(my + dx * bend)} ${r(x2)} ${r(y2)}`;
}

/** A box in oblique projection: front face, top face and the hatched side. */
export function block(x: number, y: number, w: number, h: number, depth = 16) {
  const dx = depth;
  const dy = -depth * 0.75;
  return {
    front: `M${r(x)} ${r(y)} H${r(x + w)} V${r(y + h)} H${r(x)} Z`,
    top: `M${r(x)} ${r(y)} L${r(x + dx)} ${r(y + dy)} H${r(x + w + dx)} L${r(x + w)} ${r(y)} Z`,
    side: `M${r(x + w)} ${r(y)} L${r(x + w + dx)} ${r(y + dy)} V${r(y + h + dy)} L${r(x + w)} ${r(y + h)} Z`,
  };
}

/** A flat rectangle as a path, so it can take pathLength for the draw-in. */
export const rect = (x: number, y: number, w: number, h: number) =>
  `M${r(x)} ${r(y)} H${r(x + w)} V${r(y + h)} H${r(x)} Z`;

/** A storage cylinder: open body and its top ellipse. */
export function cylinder(cx: number, top: number, rx: number, ry: number, h: number) {
  return {
    body: `M${r(cx - rx)} ${r(top)} V${r(top + h)} A${rx} ${ry} 0 0 0 ${r(cx + rx)} ${r(top + h)} V${r(top)}`,
    lid: `M${r(cx - rx)} ${r(top)} A${rx} ${ry} 0 1 0 ${r(cx + rx)} ${r(top)} A${rx} ${ry} 0 1 0 ${r(cx - rx)} ${r(top)} Z`,
    face: `M${r(cx - rx)} ${r(top)} V${r(top + h)} A${rx} ${ry} 0 0 0 ${r(cx + rx)} ${r(top + h)} V${r(top)} A${rx} ${ry} 0 0 0 ${r(cx - rx)} ${r(top)} Z`,
  };
}

/** A computer monitor seen square-on: case, screen, neck and foot. */
export function monitor(x: number, y: number, w: number, h: number) {
  const cx = x + w / 2;
  const neckTop = y + h;
  const neckBottom = y + h + 18;
  return {
    case: rect(x, y, w, h),
    screen: rect(x + 7, y + 7, w - 14, h - 14),
    neck: `M${r(cx - 12)} ${r(neckTop)} L${r(cx - 17)} ${r(neckBottom)} H${r(cx + 17)} L${r(cx + 12)} ${r(neckTop)}`,
    foot: `M${r(cx - 32)} ${r(neckBottom)} H${r(cx + 32)}`,
  };
}

/** Linear scale helper for the data figures. */
export function scale(domain: [number, number], range: [number, number]) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const k = d1 === d0 ? 0 : (r1 - r0) / (d1 - d0);
  return (value: number) => r(r0 + (value - d0) * k);
}

/** A tidy upper bound for an axis (1, 2, 2.5 or 5 times a power of ten). */
export function niceMax(value: number) {
  if (value <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(value));
  const fraction = value / power;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10;
  return nice * power;
}
