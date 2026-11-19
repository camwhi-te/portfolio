import { z } from "astro/zod";

const provenance = {
  /** "live" when fetched during this build, "snapshot" when read from the committed fallback. */
  source: z.enum(["live", "snapshot"]),
  fetchedAt: z.iso.datetime(),
};

export const accountSchema = z.object({
  kind: z.literal("account"),
  ...provenance,
  login: z.string(),
  type: z.enum(["User", "Organization"]),
  name: z.string().nullable(),
  url: z.url(),
  blog: z.string().nullable(),
  publicRepos: z.number().int().nonnegative(),
  followers: z.number().int().nonnegative(),
  createdAt: z.iso.datetime(),
});

export const repoSchema = z.object({
  kind: z.literal("repo"),
  ...provenance,
  fullName: z.string(),
  url: z.url(),
  description: z.string().nullable(),
  homepage: z.string().nullable(),
  topics: z.array(z.string()),
  license: z.string().nullable(),
  stars: z.number().int().nonnegative(),
  forks: z.number().int().nonnegative(),
  openIssues: z.number().int().nonnegative(),
  createdAt: z.iso.datetime(),
  pushedAt: z.iso.datetime(),
  defaultBranch: z.string(),
  archived: z.boolean(),
  fork: z.boolean(),
  primaryLanguage: z.string().nullable(),
  languages: z.array(z.object({ name: z.string(), bytes: z.number().nonnegative() })),
  releases: z.array(
    z.object({
      tag: z.string(),
      name: z.string().nullable(),
      publishedAt: z.iso.datetime(),
      url: z.url(),
      prerelease: z.boolean(),
    }),
  ),
  latestCommit: z
    .object({ sha: z.string(), date: z.iso.datetime(), message: z.string(), url: z.url() })
    .nullable(),
  commitActivity: z.array(z.number().int().nonnegative()),
  contributor: z
    .object({
      login: z.string(),
      contributions: z.number().int().nonnegative(),
      rank: z.number().int().positive(),
      ofListed: z.number().int().positive(),
    })
    .nullable(),
  contributorWeekly: z.array(z.object({ week: z.iso.date(), commits: z.number().int().nonnegative() })),
});

export const githubSchema = z.discriminatedUnion("kind", [accountSchema, repoSchema]);

export type AccountEntry = z.infer<typeof accountSchema>;
export type RepoEntry = z.infer<typeof repoSchema>;
