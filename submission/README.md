# DataCanvas 1.0.0 Adobe submission bundle

Prepared 27 October 2026 from the production package after `npm run release:check` passed.

## Release candidate and readiness

Use **DataCanvas 1.0.0** for the public listing. This release imports local CSV data, creates bar, line and pie charts, inserts a flat PNG in Express, and exports a chart recipe. The R1 rebuild under `docs/superpowers/` describes a separate scope that includes native report elements and portable projects. Those features are outside this package.

On 6 November 2026, all seven automated tests passed, the local release validator passed, and the staged ZIP passed its SHA-256 check. The staged ZIP is byte-for-byte identical to `dist.zip`. Run the following from the DataCanvas project root to verify the staged file:

```sh
shasum -a 256 -c submission/checks/DataCanvas-1.0.0.sha256
```

## Upload to Adobe

| Adobe field | File or source |
|---|---|
| Add-on package | `DataCanvas-1.0.0.zip` |
| Add-on icon | `listing/icon-144.png` |
| Additional icon sizes / publisher profile | `listing/icon-36.png`, `listing/icon-64.png` |
| Screenshot 1 | `listing/screenshot-1.png` |
| Additional screenshots | `listing/screenshot-2.png`, `listing/screenshot-3.png` |
| Publisher logo | `listing/publisher-logo-250.png` |
| Listing text | `metadata/marketplace-listing.md` |
| Release notes | `metadata/release-notes.md` |
| Reviewer notes | `reviewer/notes-to-reviewer.md` |

The package is separate from the listing assets. Upload `DataCanvas-1.0.0.zip` directly; do not re-zip the `submission` folder. The extracted package has the add-on files at its root, including `manifest.json`.

## Reviewer materials

- `reviewer/reviewer-guide.md` contains the walkthrough.
- `reviewer/sample.csv` is the safe synthetic fixture.
- `checks/DataCanvas-1.0.0.sha256` verifies the package file.

## Owner inputs still required in Adobe

Complete `metadata/owner-inputs.md` before final submission. These values cannot be invented in the project: support email, help URL, privacy notice URL, EULA URL, publisher identity, publisher website/description, and EU trader information if distributing in the EU.

## Before submitting for review

1. Load the add-on in a signed-in Adobe Express desktop session with Add-on Development enabled. Follow the reviewer guide and record the browser, OS, test date and results. Verify PNG insertion on an active page, PNG download, recipe round-trip, and the panel in both light and dark themes.
2. Capture at least one 1360 × 800 screenshot of the actual add-on for the listing. The staged screenshots are generated previews. Use host captures for the listing and test evidence.
3. Fill in the publisher-owned details, confirm the listing name is available, and upload the ZIP and assets separately through the Adobe Express public listing flow.

[Adobe public distribution guide](https://developer.adobe.com/express/add-ons/docs/guides/build/distribute/public-dist) · [Adobe submission checklist](https://developer.adobe.com/express/add-ons/docs/guides/build/distribute/review-process/submission-checklist)
