# which-model-are-you

## Clone

```sh
git clone https://github.com/econchick/which-model-are-you.git
cd which-model-are-you
```

## Run locally

The site is plain HTML, CSS and ES modules with no build step. It needs to be
served over HTTP (it fetches files from `content/`, and ES modules don't load
over `file://`), so start any static server from the repo root:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Checks

Requires Node 18 or newer. Run the validator after editing anything in
`content/`:

```sh
npm run validate      # same as: node scripts/validate.mjs
```

It exits non-zero on failure.

## Rebuild link previews

The pages and images in `r/` are generated. Rebuild them after changing
anything in `content/models.md`, then commit what changed:

```sh
npm install           # once: installs Playwright
npx playwright install chromium   # once, if you don't already have a browser for it
npm run previews
```

To use a Chromium you already have instead, point `CHROMIUM_PATH` at it:

```sh
CHROMIUM_PATH=/path/to/chromium npm run previews
```

## Deploy

The site is served by GitHub Pages from the `gh-pages` branch, at the root of
that branch. `gh-pages` holds the built site only, plus two files that must
stay there:

- `CNAME`: the custom domain (`yourmodel.is`)
- `.nojekyll`: tells Pages to serve files as-is

Absolute URLs in the link previews come from the canonical link in
`index.html`; if the domain changes, update it there and in `CNAME`, then
rebuild the previews.

To publish the current branch:

```sh
npm run validate

# Check out gh-pages in a separate folder
git fetch origin gh-pages
git worktree add ../site-deploy gh-pages

# Replace everything except .git, CNAME and .nojekyll with the site files
find ../site-deploy -mindepth 1 -maxdepth 1 \
  ! -name .git ! -name CNAME ! -name .nojekyll -exec rm -rf {} +
cp -R index.html favicon.svg content src styles r ../site-deploy/

# Commit and push
cd ../site-deploy
git add -A
git commit -m "Deploy $(git -C ../which-model-are-you rev-parse --short HEAD)"
git push origin gh-pages
cd -
git worktree remove ../site-deploy
```

Pages picks up the push within a minute or two. In the repository's
**Settings → Pages**, the source should be "Deploy from a branch",
branch `gh-pages`, folder `/ (root)`, with the custom domain set and
"Enforce HTTPS" on.
