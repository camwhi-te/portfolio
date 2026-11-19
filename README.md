# cameronwhite.co.uk

The portfolio of Cameron White (`camwhi-te`), set as a technical specification with drawing sheets. It's a static Astro site: every system is drawn as pen-and-ink line work, every part carries a reference numeral, and the prose is yours to write.

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # type-check, then build into dist/
npm run preview    # serve the built site
npm run sync       # refresh the committed GitHub snapshot
```

Requires Node 22.23.4 or newer.

## Filling in the blanks

Every slot you haven't written yet renders as ruled lines in non-photo blue. They read as guides on screen and disappear when the page is printed. Each blank is filled from exactly one place:

| Blank | File | Field |
| --- | --- | --- |
| Role, location, email, LinkedIn | `src/site.ts` | `role`, `location`, `email`, `linkedin` |
| Abstract on the front page | `src/content/about/intro.md` | the body (Markdown) |
| Project role, period and summary | `src/content/projects/<project>.md` | `role`, `period`, `summary` |
| Project detailed description | the same file | the body (Markdown) |
| Experience entries | `src/content/experience/<entry>.md` | `title`, `from`, `to`, `location`, `organisation`, and the body |

While `npm run dev` is running, press **B** to label every blank with the file and field it comes from.

### Reference numerals in your writing

When a project description mentions a part by its numeral, the numeral becomes live. For example, "the panel 102 hands each server to the daemon 106" links both numbers to the drawing, and pointing at either lights the part. Only numerals drawn on that page are linked. The numerals for each figure are listed in `src/lib/figures.ts` and printed under every drawing.

The site's own numbering is 10 for you, 100 for Jexpanel, 200 for Falcon Hosting, 300 for further work (310, 320…), 400 for experience and 500 for contact.

## Projects

Each Markdown file in `src/content/projects/` becomes a specification page at `/<file-name>/`:

```yaml
title: Influx
numeral: 310            # the project's reference numeral
kind: shortlist         # flagship or shortlist
order: 3                # position on the front page and in the pager
repository: camwhi-te/influx
related: [camwhi-te/influxd]
```

Jexpanel and Falcon Hosting have hand-drawn figures (`src/components/figures/`). Shortlist projects get a repository plate generated from their GitHub data.

## Live GitHub figures

Releases, stars, forks, your contribution standing and your monthly commits come from the GitHub API:

- **At build time,** the content loader fetches the repositories named in project frontmatter (`repository` and `related`). If GitHub is unreachable or rate-limited, it falls back to `src/data/github-snapshot.json`, which `npm run sync` refreshes.
- **In the browser,** the headline numbers (stars, forks, latest release, last push) are refreshed once per tab, then eased to their new values.

Environment variables (see `.env.example`):

- `GITHUB_TOKEN` raises the API limit from 60 to 5,000 requests an hour. It's worth setting on your build host; a build uses about 20 requests.
- `GITHUB_OFFLINE=1` builds from the snapshot alone.

## Deploying

The build is static HTML in `dist/` and runs on any static host. For Vercel or Netlify, use `npm run build` as the build command and `dist` as the output directory, and add `GITHUB_TOKEN` as an environment variable.

## Printing

Printing (or "Save as PDF") produces paginated A4 sheets with a running head and "Sheet n of N". Navigation, controls and every non-photo-blue mark are left out.

## Typography

- **STIX Two Text** sets everything. The Google Fonts and Fontsource builds of STIX Two strip true small caps and old-style figures, so the site uses its own subset of the production fonts from CTAN, made by `tools/fonts/subset_stix.py`. The arrows come from a tiny STIX Two Math subset.
- **Courier Prime** sets code listings and repository names.

Both families are under the SIL Open Font License; the licence ships beside the fonts in `src/assets/fonts/stix-two/OFL.txt`.

## Design records

- `PRODUCT.md`: who the site is for and what it must prove.
- `DESIGN.md` and `.impeccable/design.json`: the visual system as built.
- `.impeccable/surfaces/`: the direction contract for the pages.

Impeccable is installed in `.claude/`, so in Claude Code you can run `/impeccable audit`, `/impeccable polish` or `/impeccable critique` against the site.
