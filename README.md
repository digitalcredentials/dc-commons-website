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
- `GOOGLE_FORM`: the Google Form that receives "Get in touch" submissions. Set `action` to the form's `formResponse` URL and fill in each question's `entry.` ID (from the form's "Get pre-filled link"). The checkbox values in `index.html` must match the form's options exactly.

Links with `?src=` (for example `?src=barcelona`) are recorded in the form's `source` question, if it has one.

## Previewing locally

```
python3 -m http.server 8000
```

Then open http://localhost:8000.
