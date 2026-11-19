import { getCollection, getEntry, type CollectionEntry } from "astro:content";
import type { AccountEntry, RepoEntry } from "./github/schema.ts";

export type Project = CollectionEntry<"projects">;
export type Experience = CollectionEntry<"experience">;

export async function getProjects(): Promise<Project[]> {
  return (await getCollection("projects")).sort((a, b) => a.data.order - b.data.order);
}

export async function getExperience(): Promise<Experience[]> {
  return (await getCollection("experience")).sort((a, b) => a.data.order - b.data.order);
}

export async function getRepo(fullName: string | undefined): Promise<RepoEntry | undefined> {
  if (!fullName) return undefined;
  const entry = await getEntry("github", fullName.toLowerCase());
  return entry?.data.kind === "repo" ? entry.data : undefined;
}

export async function getAccount(login: string): Promise<AccountEntry | undefined> {
  const entry = await getEntry("github", `@${login.toLowerCase()}`);
  return entry?.data.kind === "account" ? entry.data : undefined;
}

/** When the GitHub figures were taken, and whether this build fetched them live. */
export async function getProvenance() {
  const entries = await getCollection("github");
  const first = entries[0]?.data;
  return first ? { fetchedAt: first.fetchedAt, source: first.source } : undefined;
}

/** Releases newest first; the latest stable one; and how many shipped in the last twelve months. */
export function releaseFacts(repo: RepoEntry | undefined) {
  const releases = [...(repo?.releases ?? [])].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const latest = releases.find((release) => !release.prerelease) ?? releases[0];
  const yearAgo = Date.parse(repo?.fetchedAt ?? new Date().toISOString()) - 365 * 86_400_000;
  const lastYear = releases.filter((release) => Date.parse(release.publishedAt) >= yearAgo).length;
  return { releases, latest, lastYear };
}

/** Commits by the tracked user, by calendar month, from GitHub's weekly contributor statistics. */
export function monthlyCommits(repo: RepoEntry | undefined) {
  const months = new Map<string, number>();
  for (const week of repo?.contributorWeekly ?? []) {
    const key = week.week.slice(0, 7);
    months.set(key, (months.get(key) ?? 0) + week.commits);
  }
  return [...months.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, commits]) => ({ month, commits }));
}

export function commitsInLastYear(repo: RepoEntry | undefined) {
  const weeks = repo?.contributorWeekly ?? [];
  return weeks.slice(-52).reduce((sum, week) => sum + week.commits, 0);
}
