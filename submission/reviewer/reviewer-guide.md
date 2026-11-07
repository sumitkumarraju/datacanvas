# DataCanvas reviewer guide

## Local setup

1. Run `npm ci`.
2. Run `npm run release:check`.
3. Run `npm run start`.
4. Open the Adobe Express Add-on Development panel and connect the displayed `https://localhost:5241` URL.

Adobe Express Add-on Development must be enabled in the reviewer account. The local URL is not a production service.

## Walkthrough

1. Open DataCanvas and choose **Use sample**.
2. Confirm the Month and Sales mapping and the bar preview.
3. Change duplicate handling and sorting controls.
4. Choose **Download PNG** and inspect the downloaded flat image.
5. Choose **Add chart to Adobe Express** and confirm the image is inserted on the active page.
6. Choose **Export with data**, accept the sensitive-data warning, and reload the JSON recipe.
7. Choose **Export no-data recipe**, reload it, and confirm the UI asks for CSV reimport.
8. Import a CSV containing a quoted comma, quoted newline, Unicode label, blank value, and `1e309`; confirm specific errors are shown and no chart is created until invalid data is resolved.
9. Switch the Adobe Express host between light and dark themes and confirm the panel remains readable.

## Submission screenshot

`assets/datacanvas-screenshot-1.png`, `assets/datacanvas-screenshot-2.png`, and `assets/datacanvas-screenshot-3.png` are 1360×800 listing-asset drafts covering import, chart preview/insertion, and recipe export. Before submitting, replace or supplement them with screenshots captured from the real Adobe Express host after the walkthrough above. Adobe’s review requires accurate screenshots; do not submit generated artwork as host-verification evidence.

## Review limitations

- The inserted chart is a flat PNG, not a native editable chart.
- No cloud account, backend, telemetry, or AI service is used.
- Real-host evidence must be recorded by a reviewer in Adobe Express; this repository does not fabricate screenshots or approval results.
