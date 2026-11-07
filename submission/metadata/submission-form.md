# Adobe Express public listing submission form

Prepared against Adobe’s Public add-on Distribution, Listing, Review Process, Accessibility, Compatibility, Brand, Monetization, and Generative AI guidance checked 27 October 2026.

Official references:

- [Public add-on distribution](https://developer.adobe.com/express/add-ons/docs/guides/build/distribute/public-dist)
- [Submission checklist](https://developer.adobe.com/express/add-ons/docs/guides/build/distribute/review-process/submission-checklist)
- [Branding guidelines](https://developer.adobe.com/express/add-ons/docs/guides/build/design/ux-guidelines/branding-guidelines)

## Ready-to-paste product fields

| Field | Value |
|---|---|
| Add-on name | DataCanvas |
| Summary | Turn CSV data into charts for your designs |
| Full description | DataCanvas turns local CSV data into clear bar, line, and pie charts for Adobe Express. Import a UTF-8 CSV, validate category and numeric values, choose how duplicates and missing values are handled, and preview the data behind the chart. Customize the title, colors, sorting, aggregation, and number formatting, then add the result to the current Adobe Express page as a flat PNG or download it. Export a versioned recipe to preserve mapping and style choices. Data processing happens locally in the add-on. The chart is an image, not a native editable chart; keep the recipe as the editable source. |
| Keywords | csv, charts, data visualization, bar chart, line chart, pie chart, png, data |
| Release notes | Version 1.0.1 fixes UI copying, Help, recipe export, Adobe Express naming, no-data recipe guidance and message dismissal. |
| Monetization | Free |
| Payment option | No payment option |
| Generative AI | No |
| Supported language | English |

The name is 10/25 characters, summary 42/50, and description 610/1000.

## Account-owned fields required in Adobe’s form

These cannot be safely invented in source code:

- Help URL: `REQUIRED_OWNER_INPUT`
- Support email: sumitts317@gmail.com
- Privacy Notice URL: `REQUIRED_OWNER_INPUT`
- EULA URL: `REQUIRED_OWNER_INPUT`
- Publisher name, description, website, and 250×250 publisher logo
- EU trader details, if distributing in the EU
- Notes to reviewer and real Adobe Express test credentials, if applicable

The add-on has no account, cloud service, payment, analytics, telemetry, or AI provider. The owner should publish a help page explaining local CSV processing, limits, PNG output, recipe behavior, and support contact before entering the URL.

## Uploads

- Icons: `assets/datacanvas-icon-36.png`, `assets/datacanvas-icon-64.png`, and `assets/datacanvas-icon.png` — exactly 36×36, 64×64, and 144×144 PNGs. The public-distribution flow may derive the smaller sizes from the 144×144 upload, but all three are staged for the publisher profile and branding requirements.
- Screenshots: `submission/listing/screenshot-1.png`, `submission/listing/screenshot-2.png`, and `submission/listing/screenshot-3.png` — each exactly 1360×800 PNG.
- Publisher logo draft: `assets/datacanvas-publisher-logo.png` — exactly 250×250 PNG.
- Package: `dist.zip` — generated from the production `dist/` root.

The package must be uploaded separately from the listing assets. Its extracted root must contain `manifest.json`; do not zip the project directory, and do not include hidden files or `.DS_Store` files.

Use the real-host screenshots in submission/listing/. Do not regenerate older preview assets.

## Reviewer notes

Use `docs/reviewer-guide.md`. Enable Adobe Express Add-on Development, connect the local HTTPS server, load the supplied `fixtures/sample.csv`, test PNG insertion and recipe round-trip, then test invalid CSV rows. Record the actual Adobe Express version, OS, browser, and screenshots in the submission portal. The current submission/listing images are real-host captures dated 7 November 2026.

## Paste and upload in the saved draft

Use **Your integrations → DataCanvas → Public listing → Continue editing** on the integration with the add-on URL beginning `w559njj36`.

| Portal section | What to enter or attach |
|---|---|
| Listing details | Paste the name, summary, description, and keywords above. Upload `../listing/icon-144.png`. Enter the confirmed support email and the published help URL. |
| Screenshots | Upload at least one 1360 × 800 capture of DataCanvas running in Adobe Express. |
| Version details | Upload `../DataCanvas-1.0.1.zip`, select English (US), and paste the release notes above. |
| AI usage details | Select No. DataCanvas renders charts from CSV data using deterministic processing. |
| Monetization details | Select Free. DataCanvas has no purchases or subscriptions. |
| Publisher profile | Confirm the displayed publisher identity and website. Suggested description: “I build Adobe Express add-ons for working with data in designs. DataCanvas helps you turn a CSV into a chart without leaving Adobe Express.” |
| Submit | Paste `../reviewer/1.0.1/review-response.md` and add any verified host-testing details. |

## Pages to publish

- [Help page](help.md)
- [Privacy notice draft](privacy-notice.md)
- [End User License Agreement draft](eula.md)

Publish these pages to public URLs before entering the links in Adobe. Confirm the publisher and support details in the policy drafts before publishing.
