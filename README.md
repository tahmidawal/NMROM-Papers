# NM-ROM Literature — Reading Room

Static site: curated reading list for the ViT + LinearCP NM-ROM paper. Organized by
Section A (must-cite) and Section B (relevant). 40 PDFs embedded; ~8 closed-access
papers appear as link-only cards with abstract and DOI button.

## Structure

```
.
├── index.html            # shell (loads app.js, style.css, papers.json)
├── style.css
├── app.js                # renders TOC, cards, PDF reader; search
├── papers.json           # all metadata + 150-word summaries
└── pdfs/
    ├── A-must-cite/{foundation,eq-nmrom-line,quadratic-manifolds,
    │                 latent-dynamics,neural-operators,surveys}/*.pdf
    └── B-relevant/{nm-rom-variants,graph-meshfree,hyper-reduction-classics,
                    dl-roms,latent-dynamics-conservation,
                    registration-transport,neural-operators,
                    weather-climate,geometric-mor}/*.pdf
```

## Local preview

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

(Fetch of `papers.json` needs a server; opening `index.html` from `file://` will fail.)

## Publish to GitHub Pages

Already wired to `github.com/tahmidawal/NMROM-Papers`:

```sh
# push to main
git push origin main

# enable Pages
#   Settings → Pages → Source: Deploy from a branch
#   Branch: main · Folder: / (root)  →  Save
```

Live URL after ~1 minute: `https://tahmidawal.github.io/NMROM-Papers/`.

## Editing

- **Add a paper**: append an entry to the right `papers[]` array in `papers.json` with
  `{slug, title, authors, year, venue, citations, doi, arxiv?, pdf?, summary,
  closed_access}`. Drop the PDF in the matching `pdfs/.../` folder if you have one.
- **Add a category**: add a `{id, title, blurb, papers: []}` object under a section.
- No build step. The site is static. `.nojekyll` is present so the `_`-prefixed
  behaviour of Jekyll doesn't run.
