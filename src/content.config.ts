import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { githubLoader } from "./lib/github/loader.ts";
import { githubSchema } from "./lib/github/schema.ts";
import { site } from "./site.ts";

/** A field Cam writes. Empty means "not written yet" and renders as a ruled blank. */
const blank = z.string().trim().default("");
const repoName = z.string().regex(/^[\w.-]+\/[\w.-]+$/, "use owner/name");

const projects = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    /** Reference numeral: the project's number in every drawing, list and link. */
    numeral: z.number().int().positive(),
    formerly: z.string().optional(),
    legalName: z.string().optional(),
    kind: z.enum(["flagship", "shortlist"]),
    order: z.number().int(),
    website: z.url().optional(),
    repository: repoName.optional(),
    related: z.array(repoName).default([]),
    stack: z.array(z.string()).default([]),
    company: z.object({ number: z.string(), registeredIn: z.string() }).optional(),
    services: z.array(z.string()).default([]),
    regions: z.array(z.string()).default([]),
    summary: blank,
    role: blank,
    period: blank,
  }),
});

const experience = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/experience" }),
  schema: z.object({
    organisation: blank,
    numeral: z.number().int().positive(),
    qualification: z.string().optional(),
    kind: z.enum(["work", "education"]),
    order: z.number().int(),
    link: z.url().optional(),
    title: blank,
    from: blank,
    to: blank,
    location: blank,
  }),
});

const about = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/about" }),
  schema: z.object({}),
});

const github = defineCollection({
  loader: githubLoader({
    user: site.handle,
    projectsDir: "src/content/projects",
    // Dev restarts reuse figures for six hours; a build reuses what `astro check` fetched moments earlier.
    reuseMinutes: import.meta.env.DEV ? 360 : 15,
  }),
  schema: githubSchema,
});

export const collections = { projects, experience, about, github };
