# dccommons.org

The one-page site for Digital Credentials Commons, served by GitHub Pages from this repo (see `CNAME`).

## Files

- `index.html`: the page
- `assets/css/site.css`: styles
- `assets/js/site.js`: feature flags, form handling and the hero animation
- `assets/img/`: logos from the Logo Kit v1.0 (one-line, horizontal, mark)

## Settings in `assets/js/site.js`

- `FEATURES.sampleCredential`: shows or hides the "Get a sample credential" button and the "Try it yourself" block. Off by default.
- `SAMPLE_ENDPOINT`: the service that emails the sample credential. Needed before turning the flag on.
- `GOOGLE_FORM`: the "Getting Involved with DCC" Google Form that receives "Get in touch" submissions. If anyone edits that form, check that its option text still matches the checkbox values in `index.html` exactly, and that its entry IDs haven't changed. A mismatch makes Google reject submissions silently.

Links with `?src=` (for example `?src=barcelona`) are recorded in the form's `source` question, if it has one.

## Previewing locally

```
python3 -m http.server 8000
```

Then open http://localhost:8000.
