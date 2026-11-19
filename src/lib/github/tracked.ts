/**
 * Works out which repositories to fetch from the project files themselves, so
 * adding a repository to a project's frontmatter is the only step needed to
 * bring in its figures.
 *
 *   repository: owner/name   -> metadata and language breakdown
 *   kind: flagship           -> the repository also gets releases, contributor standing and activity
 *   related: [owner/name]    -> metadata only
 */

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { parse } from "yaml";

export interface TrackedRepos {
  repos: string[];
  withLanguages: string[];
  detailed: string[];
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---/;
const REPO = /^[\w.-]+\/[\w.-]+$/;

const asRepo = (value: unknown): string | null =>
  typeof value === "string" && REPO.test(value.trim()) ? value.trim() : null;

export async function readTrackedRepos(projectsDir: string): Promise<TrackedRepos> {
  const files = (await readdir(projectsDir)).filter((file) => /\.mdx?$/.test(file));
  const repos = new Set<string>();
  const withLanguages = new Set<string>();
  const detailed = new Set<string>();

  for (const file of files) {
    const source = await readFile(join(projectsDir, file), "utf8");
    const block = FRONTMATTER.exec(source)?.[1];
    if (!block) continue;
    const data = (parse(block) ?? {}) as Record<string, unknown>;

    const primary = asRepo(data["repository"]);
    if (primary) {
      repos.add(primary);
      withLanguages.add(primary);
      if (data["kind"] === "flagship") detailed.add(primary);
    }
    const related = Array.isArray(data["related"]) ? data["related"] : [];
    for (const entry of related) {
      const repo = asRepo(entry);
      if (repo) repos.add(repo);
    }
  }

  return { repos: [...repos], withLanguages: [...withLanguages], detailed: [...detailed] };
}
