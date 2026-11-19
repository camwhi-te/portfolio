import type { Loader } from "astro/loaders";
import fallback from "../../data/github-snapshot.json";
import { fetchSnapshot, GitHubUnavailableError, type GitHubSnapshot } from "./fetch.ts";
import { readTrackedRepos } from "./tracked.ts";

interface GitHubLoaderOptions {
  /** GitHub handle whose contributions are measured. */
  user: string;
  /** Directory holding the project Markdown files that name the repositories. */
  projectsDir: string;
  /** Reuse data fetched within this many minutes (dev restarts, `astro check` then `astro build`). */
  reuseMinutes: number;
}

/**
 * Loads GitHub figures at build time. Fetches live data when it can, and
 * otherwise falls back to src/data/github-snapshot.json (refresh it with
 * `npm run sync`). Set GITHUB_TOKEN for higher rate limits, or
 * GITHUB_OFFLINE=1 to build from the snapshot alone.
 */
export function githubLoader(options: GitHubLoaderOptions): Loader {
  return {
    name: "github",
    load: async ({ store, meta, logger, parseData, generateDigest }) => {
      const tracked = await readTrackedRepos(options.projectsDir);
      const trackedKey = JSON.stringify(tracked);
      const fetchedAt = meta.get("fetchedAt");
      const fresh =
        fetchedAt !== undefined &&
        meta.get("tracked") === trackedKey &&
        Date.now() - Date.parse(fetchedAt) < options.reuseMinutes * 60_000 &&
        store.keys().length > 0;
      if (fresh) {
        logger.info(`reusing GitHub figures fetched at ${fetchedAt}`);
        return;
      }

      let snapshot = fallback as GitHubSnapshot;
      let source: "live" | "snapshot" = "snapshot";
      if (process.env["GITHUB_OFFLINE"] === "1") {
        logger.info(`GITHUB_OFFLINE=1: using the committed snapshot from ${snapshot.fetchedAt}`);
      } else {
        try {
          snapshot = await fetchSnapshot({
            user: options.user,
            ...tracked,
            token: process.env["GITHUB_TOKEN"],
            log: (message) => logger.info(message),
          });
          source = "live";
          meta.set("fetchedAt", snapshot.fetchedAt);
          meta.set("tracked", trackedKey);
        } catch (error) {
          if (!(error instanceof GitHubUnavailableError)) throw error;
          logger.warn(`GitHub unavailable (${error.message}); using the committed snapshot from ${snapshot.fetchedAt}`);
        }
      }

      store.clear();
      const provenance = { source, fetchedAt: snapshot.fetchedAt };
      for (const account of snapshot.accounts) {
        const id = `@${account.login.toLowerCase()}`;
        const data = await parseData({ id, data: { kind: "account", ...provenance, ...account } });
        store.set({ id, data, digest: generateDigest(data) });
      }
      for (const repo of snapshot.repos) {
        const id = repo.fullName.toLowerCase();
        const data = await parseData({ id, data: { kind: "repo", ...provenance, ...repo } });
        store.set({ id, data, digest: generateDigest(data) });
      }
    },
  };
}
