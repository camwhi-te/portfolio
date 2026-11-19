/**
 * Refreshes build-time GitHub figures in the browser.
 *
 * The page always ships with the numbers fetched at build time, so nothing
 * depends on this script. When it runs it asks the public API for the current
 * values (two requests per tracked repository, cached for ten minutes per tab),
 * eases changed numbers to their new value with a critically damped spring and
 * updates the "as of" stamps.
 *
 * Markup contract:
 *   <data data-live-repo="owner/name" data-live-field="stars" value="545">545</data>
 *   <time data-live-asof="owner/name" datetime="...">...</time>
 * Fields: stars, forks, openIssues, release (tag), releaseDate, pushed.
 */

interface LiveFacts {
  stars: number;
  forks: number;
  openIssues: number;
  pushedAt: string;
  release: { tag: string; publishedAt: string } | null;
  checkedAt: string;
}

const TTL_MS = 10 * 60_000;
const API = "https://api.github.com/repos/";
const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// UTC throughout, matching the build-time stamps.
const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const timeFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
});
const numberFormat = new Intl.NumberFormat("en-GB");

function readCache(repo: string): LiveFacts | null {
  try {
    const raw = sessionStorage.getItem(`live:${repo}`);
    if (!raw) return null;
    const facts = JSON.parse(raw) as LiveFacts;
    return Date.now() - Date.parse(facts.checkedAt) < TTL_MS ? facts : null;
  } catch {
    return null;
  }
}

function writeCache(repo: string, facts: LiveFacts) {
  try {
    sessionStorage.setItem(`live:${repo}`, JSON.stringify(facts));
  } catch {
    /* storage unavailable: fine, we just fetch again next time */
  }
}

async function fetchFacts(repo: string): Promise<LiveFacts | null> {
  const cached = readCache(repo);
  if (cached) return cached;
  const init: RequestInit = { headers: { Accept: "application/vnd.github+json" } };
  try {
    const [metaResponse, releaseResponse] = await Promise.all([
      fetch(`${API}${repo}`, init),
      fetch(`${API}${repo}/releases/latest`, init),
    ]);
    if (!metaResponse.ok) return null;
    const meta = (await metaResponse.json()) as {
      stargazers_count: number;
      forks_count: number;
      open_issues_count: number;
      pushed_at: string;
    };
    const release = releaseResponse.ok
      ? ((await releaseResponse.json()) as { tag_name: string; published_at: string })
      : null;
    const facts: LiveFacts = {
      stars: meta.stargazers_count,
      forks: meta.forks_count,
      openIssues: meta.open_issues_count,
      pushedAt: meta.pushed_at,
      release: release ? { tag: release.tag_name, publishedAt: release.published_at } : null,
      checkedAt: new Date().toISOString(),
    };
    writeCache(repo, facts);
    return facts;
  } catch {
    return null;
  }
}

/** Eases a number to its target along a critically damped spring. */
function settle(element: HTMLDataElement, target: number) {
  const start = Number(element.value);
  if (!Number.isFinite(start) || start === target || reduceMotion()) {
    element.value = String(target);
    element.textContent = numberFormat.format(target);
    return;
  }
  const omega = 9; // natural frequency (rad/s): settles in roughly half a second
  let position = start;
  let velocity = 0;
  let last = performance.now();
  element.value = String(target);
  element.dataset["settling"] = "";
  const step = (now: number) => {
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    const acceleration = -omega * omega * (position - target) - 2 * omega * velocity;
    velocity += acceleration * dt;
    position += velocity * dt;
    if (Math.abs(position - target) < 0.4 && Math.abs(velocity) < 0.4) {
      element.textContent = numberFormat.format(target);
      delete element.dataset["settling"];
      return;
    }
    element.textContent = numberFormat.format(Math.round(position));
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function apply(repo: string, facts: LiveFacts) {
  const fields = document.querySelectorAll<HTMLDataElement>(`data[data-live-repo="${CSS.escape(repo)}"]`);
  for (const element of fields) {
    switch (element.dataset["liveField"]) {
      case "stars":
        settle(element, facts.stars);
        break;
      case "forks":
        settle(element, facts.forks);
        break;
      case "openIssues":
        settle(element, facts.openIssues);
        break;
      case "release":
        if (facts.release) {
          element.value = facts.release.tag;
          element.textContent = facts.release.tag;
        }
        break;
      case "releaseDate":
        if (facts.release) {
          element.value = facts.release.publishedAt;
          element.textContent = dateFormat.format(new Date(facts.release.publishedAt));
        }
        break;
      case "pushed":
        element.value = facts.pushedAt;
        element.textContent = dateFormat.format(new Date(facts.pushedAt));
        break;
    }
  }
  for (const stamp of document.querySelectorAll<HTMLTimeElement>(`time[data-live-asof="${CSS.escape(repo)}"]`)) {
    stamp.dateTime = facts.checkedAt;
    stamp.textContent = `${dateFormat.format(new Date(facts.checkedAt))}, ${timeFormat.format(new Date(facts.checkedAt))}`;
    stamp.dataset["live"] = "";
  }
}

export async function refreshLiveFigures(root: ParentNode = document) {
  const repos = new Set<string>();
  for (const element of root.querySelectorAll<HTMLElement>("[data-live-repo]")) {
    const repo = element.dataset["liveRepo"];
    if (repo) repos.add(repo);
  }
  await Promise.all(
    [...repos].map(async (repo) => {
      const facts = await fetchFacts(repo);
      if (facts) apply(repo, facts);
    }),
  );
}
