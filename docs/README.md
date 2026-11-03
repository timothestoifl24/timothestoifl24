# timothestoifl24.dev: site documentation

Source of **[www.timothestoifl24.dev](https://www.timothestoifl24.dev)**, a dashboard of my hobby projects.
Profile & CV: **[timothe.stoifl.app](https://timothe.stoifl.app)**

This file documents how the site works. The short [README](../README.md) in the repo root is what shows on my GitHub profile.

Built with [VitePress](https://vitepress.dev) (default theme plus a few custom components) and deployed to GitHub Pages by GitHub Actions.

---

## Layout

```
data/projects.yaml           all projects (single source of truth)
site/index.md                Home page (profile panel, intro, project list)
site/projects/index.md       Projects page (project list)
site/public/                 static files: CNAME, favicon, og-image.png, photo.jpg, previews/
site/.vitepress/             config, data loader + validation, theme components
design/og-image.svg          source of site/public/og-image.png
docs/README.md               this file
README.md                    short profile README (shown on github.com/timothestoifl24)
scripts/dev.sh               Podman wrapper (no local Node needed)
scripts/readme-panel.py      regenerates the README profile panel from photo.jpg
.github/readme/              profile panel images (light/dark) used in README.md
.github/workflows/deploy.yml build + deploy on push to main
```

## Add a project

1. Add an entry to `data/projects.yaml`:

   ```yaml
   - slug: my-tool                  # kebab-case, unique
     name: My Tool
     one_line: "What it does in one sentence."
     category: Apps/Tools           # small label on the card
     status: active                 # active | maintained | paused | archived
     featured: false                # true = sorted to the top of "My Projects"
     stack: [Python, Docker]
     repo: https://github.com/timothestoifl24/my-tool
     site: https://my-tool.example  # optional; preview image + title link here, else to repo
     created: 2026-08-13            # date the project started (YYYY-MM-DD)
   ```

2. Copy the repo's `social-preview.svg` to `site/public/previews/<slug>.svg`.
   It's picked up automatically. Use `preview: previews/other-name.svg` to point somewhere else.
   Details such as screenshots and setup instructions live on each project's own GitHub page; the card links there.
3. Add a row to the project table in the root `README.md` (it's written by hand).

The build **fails** if a required field is missing, a status is unknown, a slug is duplicated, or a preview file doesn't exist.
Bad data never reaches the live site.

Archived projects are hidden in a collapsed "Archived projects" section at the bottom.

## Run locally

With **Podman** (no Node install needed; set `ENGINE=docker` for Docker):

```bash
scripts/dev.sh install
```

```bash
scripts/dev.sh dev
```

```bash
scripts/dev.sh serve
```

```bash
scripts/dev.sh linkcheck
```

| Command     | What it does |
|-------------|--------------|
| `install`   | `npm ci` in a `node:22` container |
| `dev`       | hot-reload dev server on http://localhost:5173 |
| `build`     | production build into `site/.vitepress/dist` |
| `serve`     | build, then serve `dist` in the container `timothestoifl24-site` on http://localhost:4173 (`scripts/dev.sh stop` to remove it) |
| `linkcheck` | check every link in the built site with [lychee](https://github.com/lycheeverse/lychee) |

With **Node 22** installed: `npm ci`, then `npm run dev`, `npm run build` or `npm run preview`.

If you change `site/public/photo.jpg`, regenerate the README panel too:

```bash
python3 scripts/readme-panel.py
```

To regenerate the Open Graph image after editing `design/og-image.svg`:

```bash
podman run --rm -v "$PWD":/app -w /app docker.io/library/node:22.23.4-alpine sh -c 'apk add --no-cache rsvg-convert font-dejavu >/dev/null && rsvg-convert -w 1200 -h 630 design/og-image.svg -o site/public/og-image.png'
```

## Deploy

Push to `main`. The **Deploy to GitHub Pages** workflow runs `npm ci` and `npm run build`, then publishes `site/.vitepress/dist`.
You can follow it under the repo's **Actions** tab, and re-run it manually with *Run workflow*.
The custom domain comes from `site/public/CNAME`.

Dependencies are pinned to exact versions (`package.json` + `package-lock.json`) and the workflow's actions are pinned to commit SHAs.

## DNS records for the custom domain

The site's primary address is **`www.timothestoifl24.dev`** (set in `site/public/CNAME`).
Set these at the DNS provider for `timothestoifl24.dev`:

| Host  | Type  | Value |
|-------|-------|-------|
| `www` | CNAME | `timothestoifl24.github.io.` |
| `@`   | A     | `185.199.108.153` |
| `@`   | A     | `185.199.109.153` |
| `@`   | A     | `185.199.110.153` |
| `@`   | A     | `185.199.111.153` |
| `@`   | AAAA  | `2606:50c0:8000::153` |
| `@`   | AAAA  | `2606:50c0:8001::153` |
| `@`   | AAAA  | `2606:50c0:8002::153` |
| `@`   | AAAA  | `2606:50c0:8003::153` |
| `_github-pages-challenge-timothestoifl24` | TXT | *value shown by GitHub when you verify the domain (recommended)* |

- The `www` CNAME serves the site. The apex A/AAAA records are optional but recommended: with them, GitHub redirects `timothestoifl24.dev` to `www.timothestoifl24.dev`.
- Remove any other A/AAAA/ALIAS records on `@`, and don't use a wildcard `*` record.
- `.dev` is on the HSTS preload list, so browsers only use HTTPS. The site won't load at all until GitHub has issued its certificate (usually minutes, up to ~24 h after DNS resolves).
- Existing records for subdomains such as `statora.timothestoifl24.dev` aren't affected.

Check propagation:

```bash
dig +short www.timothestoifl24.dev CNAME
```

```bash
dig +short timothestoifl24.dev A
```

## Manual setup checklist

- [ ] **DNS:** create the records above.
- [ ] **Verify the domain** (protects against domain takeover): GitHub → *Settings* (your account) → *Pages* → *Add a domain* → `timothestoifl24.dev` (verifying the apex also covers `www`) → add the TXT record → *Verify*.
- [ ] **Enable Pages:** this repo → *Settings* → *Pages* → *Build and deployment* → Source: **GitHub Actions**.
- [ ] Push to `main` (or run the workflow manually) and wait for the first deployment to go green.
- [ ] **Custom domain:** *Settings* → *Pages* → Custom domain: `www.timothestoifl24.dev` → *Save*, then wait for the DNS check to pass.
- [ ] **HTTPS:** once the certificate is issued, tick **Enforce HTTPS**.
- [ ] Open https://www.timothestoifl24.dev, and check that https://timothestoifl24.dev redirects to it.
- [ ] **Content:** resolve every `# TODO` in `data/projects.yaml`, and adjust the intro in `site/index.md` if needed.
