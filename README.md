# DataCanvas

DataCanvas 1.0.1 creates bar, line and pie charts from local UTF-8 CSV files inside Adobe Express. Insert a flat PNG into your document, download a PNG, or save a recipe for future editing. Data stays in the panel until you choose to insert or export it.

## Help and support

[Read the user guide](submission/metadata/help.md). Contact **sumitts317@gmail.com**. Publisher: **sumit kumar**, https://skrdev.me/.

Import a CSV with headers or choose Use sample. Select Category and Value, resolve data errors, and adjust title, colours, sorting and number format. Select **Add chart to Adobe Express** or **Download PNG**. The inserted chart is a flat image, not a native editable chart.

Export with data asks for confirmation and saves original CSV cells plus settings in a JSON recipe. Keep that file private. A no-data recipe restores settings only and requires the original CSV before chart creation. Help opens within the panel; operation messages have a Dismiss button.

Limits: 2 MB CSV, 5,000 rows, 20 columns. Pie charts require up to 12 non-negative values and a positive total. No publisher account, backend, payments, telemetry or generative AI is used by the add-on.

## Development

Run `npm ci`, `npm test`, then `npm start`. Enable Add-on Development in Adobe Express and connect to the HTTPS URL printed by the CLI. `npm run release:check` tests and packages the project and validates the ZIP.

## Version 1.0.1

Fixes panel copying, Help, recipe export in the host sandbox, Adobe Express naming, no-data recipe guidance and dismissible operation messages. Seven core tests, production build, package validation and main real-host flows passed on 7 November 2026. Actual keyboard clipboard/canvas-paste checks passed in Chrome on macOS. Other platforms and Adobe’s subsequent review are not covered by those checks.

[Submission materials](submission/README.md) · [Verification](submission/reviewer/1.0.1/verification.md)
