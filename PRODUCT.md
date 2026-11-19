# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated ("You choose the framework and tools"). Chosen: **Astro** (static output) with TypeScript (strict) and hand-authored modern CSS, no CSS framework. Astro's content collections give every owner-written slot a typed, single-file home; static HTML keeps the site host-agnostic. No deploy target was specified; the repo description names `cameronwhite.co.uk` as the address.

## Users

Primary (confirmed): **employers and recruiters** hiring for software engineering roles. They are assessing a candidate: what the person built, how substantial it is, what they did on it, and how to reach them. *Inferred, not confirmed:* most arrive from a CV, LinkedIn or GitHub link and skim before they read, on desktop and on phone, sometimes printing or saving a page to share with a hiring panel.

## Product Purpose

Personal portfolio for Cameron White (GitHub display name "Cam", handle `camwhi-te`), published at cameronwhite.co.uk. It presents Cam's flagship work, a short list of further projects, and an experience record. Success: a hiring manager leaves knowing what Cam has built and shipped, and how to get in touch.

## Positioning

The work is real, public and in production, and it can be checked:

- **Jexpanel** (formerly Jexactyl) is an open-source game management panel and billing system (`Jexactyl/Jexactyl`, PHP + TypeScript). Cam is the second-largest contributor of all time, behind only the original Pterodactyl author.
- **Falcon Hosting Ltd** is a UK hosting company (Minecraft, Rust and Hytale servers, VPS, container and web-app hosting) that offers Jexpanel as a hosted app.

Another portfolio can't truthfully borrow this: it's an open-source product at version 4 with hundreds of forks, alongside a registered company running it for customers.

## Operating Context

- The owner writes all prose. Every prose slot ships **empty** and has to read as an intentional blank awaiting an entry, never as broken or unfinished UI.
- Owner edits happen in Markdown/TypeScript content files in this repo; each blank must map to one obvious file.
- Facts sourced from GitHub (stars, forks, releases, languages, commit counts) may be shown. They are fetched at build time, and a committed snapshot is used when the API is unreachable or rate-limited.

## Capabilities and Constraints

- **Featured:** Jexpanel and Falcon Hosting.
- **Shortlist (confirmed format, delegated selection):** a few hand-picked further projects, each with a blank write-up slot; no automatic list of every repo. Initial pick: Influx, Teledash, WSL UI and Scribbl. It's editable.
- **Experience (confirmed):** entries for Telefónica, Jexactyl, Falcon Hosting and a BSc in Software Engineering, taken from the GitHub bio. Titles, dates, institutions and descriptions stay blank; the owner will fill them in.
- **Falcon Hosting** has no public repositories. Show no code statistics for it; link to falconhosting.co.uk.
- **Open decisions:** contact channels (email, LinkedIn, etc.), Cam's role on each project, and the shortlist membership. Leave each as a fillable field; never fill one in with a guess.

## Brand Commitments

- Pinned by the owner: "a typography / paper / Times New Roman-like theme", "authentic yet still technically advanced".
- Names: Cameron White / Cam / `camwhi-te`. Third-party names (Jexpanel, Jexactyl, Falcon Hosting, Telefónica) appear as plain names only. No logos unless the owner supplies them.

## Evidence on Hand

GitHub public API, retrieved 2026-11-19:

- `Jexactyl/Jexactyl`: 545 stars, 216 forks, latest release v4.0.7 (2026-08-18), v4.0.0 released 2026-03-26. Languages: PHP, TypeScript. `camwhi-te` has 619 contributions (second of all contributors).
- `Jexactyl` organisation: 15 public repos, including docs, `jexpanel.com` (TypeScript landing site), SuperDaemon (Go, fork of Wings), Sentry ("a Node.JS modular security package for Jexpanel 4"), Bedrock (installer) and `upgrade` (v3 to v4 migration).
- `camwhi-te`: 31 public repos and 47 followers. Most-starred personal repo: Scribbl (7 stars).
- Falcon Hosting Ltd: registered in England & Wales, Company No. 15676555 (from falconhosting.co.uk).

Absent, and not to be fabricated: screenshots, testimonials, client names, traffic or revenue figures, job titles and dates.

## Product Principles

1. **Evidence over adjectives.** Show what can be verified (repositories, releases, contribution counts, a live company) and leave every claim and description to Cam's own words.
2. **Blank by design.** An empty slot looks like a ruled entry waiting to be written in, and filling it means editing exactly one file.
3. **Recruiter speed.** Who Cam is, the two flagship projects and a way to make contact are reachable from the first screen without hunting.
4. **The site is part of the proof.** Its engineering (speed, accessibility, print output, data plumbing) should itself show a capable software engineer at work.
