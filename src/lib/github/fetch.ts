/**
 * GitHub facts for the portfolio, fetched from the public REST API.
 *
 * Plain, erasable TypeScript with no Astro imports, so the same module runs
 * inside the content loader (build and dev) and in `npm run sync`, which
 * Node executes directly.
 */

export interface LanguageShare {
  name: string;
  bytes: number;
}

export interface ReleaseFact {
  tag: string;
  name: string | null;
  publishedAt: string;
  url: string;
  prerelease: boolean;
}

export interface CommitFact {
  sha: string;
  date: string;
  message: string;
  url: string;
}

export interface ContributorFact {
  login: string;
  contributions: number;
  /** 1-based position among all contributors, ordered by contributions. */
  rank: number;
  /** Contributors listed by the API (it caps the first page at 100). */
  ofListed: number;
}

/** One ISO week of an author's activity, as reported by /stats/contributors. */
export interface WeeklyCommits {
  week: string;
  commits: number;
}

export interface RepoFacts {
  fullName: string;
  url: string;
  description: string | null;
  homepage: string | null;
  topics: string[];
  license: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  createdAt: string;
  pushedAt: string;
  defaultBranch: string;
  archived: boolean;
  fork: boolean;
  primaryLanguage: string | null;
  languages: LanguageShare[];
  releases: ReleaseFact[];
  latestCommit: CommitFact | null;
  /** Total commits per week for the last 52 weeks, oldest first. */
  commitActivity: number[];
  contributor: ContributorFact | null;
  /** The tracked user's weekly commits from their first active week onwards. */
  contributorWeekly: WeeklyCommits[];
}

export interface AccountFacts {
  login: string;
  type: "User" | "Organization";
  name: string | null;
  url: string;
  blog: string | null;
  publicRepos: number;
  followers: number;
  createdAt: string;
}

export interface GitHubSnapshot {
  fetchedAt: string;
  user: string;
  accounts: AccountFacts[];
  repos: RepoFacts[];
}

export interface FetchOptions {
  /** The person whose contributions are measured. */
  user: string;
  /** Repositories to describe, as "owner/name". Metadata comes from one listing per owner. */
  repos: string[];
  /** Repositories that also get a language breakdown (one request each). */
  withLanguages: string[];
  /** Repositories that also get releases, contributor standing and activity (five or more requests each). */
  detailed: string[];
  token?: string | undefined;
  timeoutMs?: number;
  log?: (message: string) => void;
}

export class GitHubUnavailableError extends Error {
  override name = "GitHubUnavailableError";
}

const API = "https://api.github.com";

interface ApiRepo {
  full_name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  topics?: string[];
  license: { spdx_id: string | null; name: string } | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  pushed_at: string;
  default_branch: string;
  archived: boolean;
  fork: boolean;
  language: string | null;
}

interface ApiAccount {
  login: string;
  type: "User" | "Organization";
  name: string | null;
  html_url: string;
  blog: string | null;
  public_repos: number;
  followers: number;
  created_at: string;
}

interface ApiRelease {
  tag_name: string;
  name: string | null;
  published_at: string | null;
  html_url: string;
  draft: boolean;
  prerelease: boolean;
}

/** Pre-release by GitHub's flag or by a semver pre-release suffix in the tag. */
const isPrerelease = (release: ApiRelease) => release.prerelease || /-(alpha|beta|rc|pre)/i.test(release.tag_name);

interface ApiCommit {
  sha: string;
  html_url: string;
  commit: { message: string; author: { date: string } | null; committer: { date: string } | null };
}

interface ApiContributor {
  login?: string;
  contributions: number;
  type: string;
}

interface ApiContributorStats {
  author: { login: string } | null;
  weeks: { w: number; c: number }[];
}

interface ApiWeekActivity {
  week: number;
  total: number;
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function createClient(options: FetchOptions) {
  const timeoutMs = options.timeoutMs ?? 15_000;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "cameronwhite-co-uk-portfolio",
  };
  if (options.token) headers["Authorization"] = `Bearer ${options.token}`;

  let requests = 0;

  /**
   * GET a path. Resolves `null` for 404s. Statistics endpoints answer 202
   * while GitHub computes them, so those are retried with backoff.
   */
  async function get<T>(path: string, { allowPending = false } = {}): Promise<T | null> {
    for (let attempt = 0; attempt < 6; attempt++) {
      requests++;
      let response: Response;
      try {
        response = await fetch(`${API}${path}`, { headers, signal: AbortSignal.timeout(timeoutMs) });
      } catch (error) {
        throw new GitHubUnavailableError(`request to ${path} failed: ${(error as Error).message}`);
      }
      if (response.status === 202 && allowPending) {
        await sleep(1500 * (attempt + 1));
        continue;
      }
      if (response.status === 404) return null;
      if (response.status === 403 || response.status === 429) {
        const remaining = response.headers.get("x-ratelimit-remaining");
        const reset = Number(response.headers.get("x-ratelimit-reset") ?? 0) * 1000;
        const when = reset ? ` (resets ${new Date(reset).toISOString()})` : "";
        throw new GitHubUnavailableError(
          remaining === "0" ? `rate limit exhausted${when}` : `GitHub refused ${path} with ${response.status}`,
        );
      }
      if (!response.ok) throw new GitHubUnavailableError(`GitHub answered ${response.status} for ${path}`);
      if (response.status === 202) return null;
      return (await response.json()) as T;
    }
    options.log?.(`GitHub was still computing ${path}; leaving it empty`);
    return null;
  }

  return { get, count: () => requests };
}

function toRepoFacts(repo: ApiRepo): RepoFacts {
  return {
    fullName: repo.full_name,
    url: repo.html_url,
    description: repo.description,
    homepage: repo.homepage || null,
    topics: repo.topics ?? [],
    license: repo.license?.spdx_id && repo.license.spdx_id !== "NOASSERTION" ? repo.license.spdx_id : null,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    openIssues: repo.open_issues_count,
    createdAt: repo.created_at,
    pushedAt: repo.pushed_at,
    defaultBranch: repo.default_branch,
    archived: repo.archived,
    fork: repo.fork,
    primaryLanguage: repo.language,
    languages: [],
    releases: [],
    latestCommit: null,
    commitActivity: [],
    contributor: null,
    contributorWeekly: [],
  };
}

const isoWeek = (unixSeconds: number) => new Date(unixSeconds * 1000).toISOString().slice(0, 10);

export async function fetchSnapshot(options: FetchOptions): Promise<GitHubSnapshot> {
  const client = createClient(options);
  const lower = (name: string) => name.toLowerCase();
  const wanted = [...new Set([...options.repos, ...options.withLanguages, ...options.detailed].map(lower))];
  const withLanguages = new Set([...options.withLanguages, ...options.detailed].map(lower));
  const detailed = new Set(options.detailed.map(lower));

  // One account lookup and one repository listing per owner covers the
  // metadata of every tracked repository.
  const owners = [...new Set([options.user, ...wanted.map((name) => name.split("/")[0] ?? "")].map(lower))].filter(
    Boolean,
  );
  const accounts: AccountFacts[] = [];
  const listed = new Map<string, ApiRepo>();
  for (const owner of owners) {
    const account = await client.get<ApiAccount>(`/users/${owner}`);
    if (!account) continue;
    accounts.push({
      login: account.login,
      type: account.type,
      name: account.name,
      url: account.html_url,
      blog: account.blog || null,
      publicRepos: account.public_repos,
      followers: account.followers,
      createdAt: account.created_at,
    });
    if (!wanted.some((name) => name.startsWith(`${owner}/`))) continue;
    const base = account.type === "Organization" ? `/orgs/${owner}/repos?type=public` : `/users/${owner}/repos?type=owner`;
    for (let page = 1; page <= 5; page++) {
      const batch = await client.get<ApiRepo[]>(`${base}&per_page=100&page=${page}`);
      for (const repo of batch ?? []) listed.set(lower(repo.full_name), repo);
      if (!batch || batch.length < 100) break;
    }
  }

  const repos: RepoFacts[] = [];
  for (const fullName of wanted) {
    const meta = listed.get(fullName) ?? (await client.get<ApiRepo>(`/repos/${fullName}`));
    if (!meta) {
      options.log?.(`repository ${fullName} was not found; skipping it`);
      continue;
    }
    const facts = toRepoFacts(meta);

    if (withLanguages.has(fullName)) {
      const languages = await client.get<Record<string, number>>(`/repos/${fullName}/languages`);
      facts.languages = Object.entries(languages ?? {})
        .map(([name, bytes]) => ({ name, bytes }))
        .sort((a, b) => b.bytes - a.bytes);
    }

    if (detailed.has(fullName)) {
      const releases: ApiRelease[] = [];
      for (let page = 1; page <= 5; page++) {
        const batch = await client.get<ApiRelease[]>(`/repos/${fullName}/releases?per_page=100&page=${page}`);
        releases.push(...(batch ?? []));
        if (!batch || batch.length < 100) break;
      }
      facts.releases = releases
        .filter((release) => !release.draft && release.published_at)
        .map((release) => ({
          tag: release.tag_name,
          name: release.name,
          publishedAt: release.published_at as string,
          url: release.html_url,
          prerelease: isPrerelease(release),
        }));

      const commits = await client.get<ApiCommit[]>(
        `/repos/${fullName}/commits?sha=${encodeURIComponent(facts.defaultBranch)}&per_page=1`,
      );
      const head = commits?.[0];
      if (head) {
        facts.latestCommit = {
          sha: head.sha,
          date: head.commit.committer?.date ?? head.commit.author?.date ?? facts.pushedAt,
          message: head.commit.message.split("\n")[0] ?? "",
          url: head.html_url,
        };
      }

      const contributors = await client.get<ApiContributor[]>(`/repos/${fullName}/contributors?per_page=100`);
      const people = (contributors ?? []).filter((person) => person.login);
      const index = people.findIndex((person) => lower(person.login ?? "") === lower(options.user));
      const match = people[index];
      if (match?.login) {
        facts.contributor = {
          login: match.login,
          contributions: match.contributions,
          rank: index + 1,
          ofListed: people.length,
        };
      }

      const activity = await client.get<ApiWeekActivity[]>(`/repos/${fullName}/stats/commit_activity`, {
        allowPending: true,
      });
      facts.commitActivity = (activity ?? []).map((week) => week.total);

      const stats = await client.get<ApiContributorStats[]>(`/repos/${fullName}/stats/contributors`, {
        allowPending: true,
      });
      const mine = (stats ?? []).find((entry) => lower(entry.author?.login ?? "") === lower(options.user));
      if (mine) {
        const weeks = [...mine.weeks].sort((a, b) => a.w - b.w);
        const first = weeks.findIndex((week) => week.c > 0);
        facts.contributorWeekly =
          first === -1 ? [] : weeks.slice(first).map((week) => ({ week: isoWeek(week.w), commits: week.c }));
      }
    }

    repos.push(facts);
  }

  options.log?.(`fetched ${repos.length} repositories and ${accounts.length} accounts in ${client.count()} requests`);
  return { fetchedAt: new Date().toISOString(), user: options.user, accounts, repos };
}
