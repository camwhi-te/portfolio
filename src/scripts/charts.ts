/**
 * Reading the data figures. Pointing anywhere over a panel reads the nearest
 * month or release; with the figure focused, the arrow keys step through
 * months and Shift with the arrows steps through releases. The readout is a
 * polite live region, and the table view under each figure holds every value.
 */

type MonthPoint = [x: number, label: string, value: number];
type ReleasePoint = [x: number, tag: string, date: string, level: string];
interface Series {
  months: MonthPoint[];
  releases: ReleasePoint[];
}

const levelName: Record<string, string> = {
  major: "major release",
  minor: "minor release",
  patch: "patch release",
  pre: "pre-release",
};

function nearest(points: { 0: number }[], x: number) {
  let best = 0;
  let distance = Infinity;
  points.forEach((point, index) => {
    const d = Math.abs(point[0] - x);
    if (d < distance) {
      distance = d;
      best = index;
    }
  });
  return best;
}

function setup(canvas: HTMLElement) {
  const svg = canvas.querySelector<SVGSVGElement>("svg[data-series]");
  const figure = canvas.closest("figure");
  const readout = figure?.querySelector<HTMLElement>(".chart__readout");
  const crosshair = svg?.querySelector<SVGLineElement>(".crosshair");
  if (!svg || !readout || !crosshair) return;
  const series = JSON.parse(svg.dataset["series"] ?? "{}") as Series;
  const user = svg.dataset["user"] ?? "";
  const resting = readout.textContent ?? "";
  const chart = canvas.closest<HTMLElement>(".chart");
  let monthIndex = series.months.length - 1;
  let releaseIndex = series.releases.length - 1;

  const clear = () => {
    for (const element of svg.querySelectorAll(".is-active")) element.classList.remove("is-active");
  };

  const write = (strong: string, rest: string) => {
    const bold = document.createElement("strong");
    bold.textContent = strong;
    readout.replaceChildren(bold, document.createTextNode(rest));
  };

  const showMonth = (index: number) => {
    const point = series.months[index];
    if (!point) return;
    monthIndex = index;
    clear();
    svg.querySelector(`[data-month="${index}"]`)?.classList.add("is-active");
    crosshair.setAttribute("x1", String(point[0]));
    crosshair.setAttribute("x2", String(point[0]));
    chart?.classList.add("is-reading");
    const commits = point[2] === 1 ? "1 commit" : `${point[2]} commits`;
    write(point[1], `: ${commits}${user ? ` by ${user}` : ""}`);
  };

  const showRelease = (index: number) => {
    const point = series.releases[index];
    if (!point) return;
    releaseIndex = index;
    clear();
    svg.querySelector(`[data-release="${index}"]`)?.classList.add("is-active");
    crosshair.setAttribute("x1", String(point[0]));
    crosshair.setAttribute("x2", String(point[0]));
    chart?.classList.add("is-reading");
    write(point[1], `, ${levelName[point[3]] ?? "release"}, published ${point[2]}`);
  };

  const rest = () => {
    clear();
    chart?.classList.remove("is-reading");
    readout.textContent = resting;
  };

  const toSvgX = (event: PointerEvent) => {
    const matrix = svg.getScreenCTM();
    if (!matrix) return null;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    return point.x;
  };

  for (const hit of svg.querySelectorAll<SVGRectElement>(".hit")) {
    hit.addEventListener("pointermove", (event) => {
      const x = toSvgX(event);
      if (x === null) return;
      if (hit.dataset["panel"] === "releases") showRelease(nearest(series.releases, x));
      else showMonth(nearest(series.months, x));
    });
  }
  svg.addEventListener("pointerleave", () => {
    if (document.activeElement !== canvas) rest();
  });
  canvas.addEventListener("focus", () => showMonth(monthIndex));
  canvas.addEventListener("blur", rest);
  canvas.addEventListener("keydown", (event) => {
    const releases = event.shiftKey;
    const count = releases ? series.releases.length : series.months.length;
    const current = releases ? releaseIndex : monthIndex;
    let next = current;
    if (event.key === "ArrowLeft") next = Math.max(0, current - 1);
    else if (event.key === "ArrowRight") next = Math.min(count - 1, current + 1);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = count - 1;
    else return;
    event.preventDefault();
    if (releases) showRelease(next);
    else showMonth(next);
  });
}

export function initCharts() {
  for (const canvas of document.querySelectorAll<HTMLElement>(".chart__canvas")) setup(canvas);
}
