/**
 * Refreshes src/data/github-snapshot.json, the committed copy of the GitHub
 * figures that builds fall back on when the API is unreachable or rate-limited.
 *
 *   npm run sync                    (60 requests/hour without a token)
 *   GITHUB_TOKEN=... npm run sync   (5,000 requests/hour)
 *
 * Node runs this file directly; it relies on Node's built-in TypeScript type stripping.
 */

import { writeFile } from "node:fs/promises";
import { fetchSnapshot } from "../src/lib/github/fetch.ts";
import { readTrackedRepos } from "../src/lib/github/tracked.ts";
import { site } from "../src/site.ts";

const OUT = new URL("../src/data/github-snapshot.json", import.meta.url);

const tracked = await readTrackedRepos("src/content/projects");
console.log(
  `tracking ${tracked.repos.length} repositories (${tracked.detailed.length} in detail) for ${site.handle}`,
);

const snapshot = await fetchSnapshot({
  user: site.handle,
  ...tracked,
  token: process.env["GITHUB_TOKEN"],
  log: (message) => console.log(message),
});

await writeFile(OUT, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(`wrote ${OUT.pathname} (${snapshot.repos.length} repositories, fetched ${snapshot.fetchedAt})`);
