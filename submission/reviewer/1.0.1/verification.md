# Review regression verification

Date: 7 November 2026. Product: DataCanvas 1.0.1. Environment: macOS, signed-in Chrome, Adobe Express development host at localhost:5244. Production bundle tested after packaging.

| Review finding | Change | Evidence |
| --- | --- | --- |
| UI content copying | CSS selection/drag restrictions plus capture-phase copy/cut/drag cancellation outside text fields | Host DOM copy event cancelled for heading, allowed for editable Title input; no claim of OS clipboard paste testing |
| Help unresponsive | Native button opens HTML dialog | Host help.png; Close help tested |
| Export with data unresponsive | HTML confirmation replaces window.confirm; object URL retained for download | Host download succeeds; host-recipe.json contains original rows and settings; cancel tested |
| Adobe branding | Full product name in UI and listing metadata | Actual host chart action used successfully; source text scan |
| No-data recipe stale UI | Dedicated Import CSV prompt, collapsed saved-settings disclosure, chart controls hidden, data export disabled | no-data.png; import CSV then actual host chart insertion succeeds |
| Notifications persist | Top-of-panel dismissible operation messages; derived validation clears on resolution | Dismiss tested; source-data notice clears after CSV import |

Core tests: 7 passed. Production webpack build and ZIP validation passed. git diff --check passed. Existing webpack bundle-size and HTML child-compilation warnings remain; they are not review-finding regressions.

Host regression script: scripts/review-host-regression.js, run with playwright-cli run-code while the DataCanvas development panel is open at localhost:5244. This is a real host test and inserts a sample chart into the open test document. Fixture paths currently target this workspace.

The shared Google Drive review folder could not be fetched through the web tool. Fixes were based on the six detailed findings supplied in the email and reproduced source behavior. No claim of viewing the reviewer videos is made.

Not yet performed: Adobe's subsequent review, production marketplace installation of 1.0.1, other-browser/OS clipboard-paste testing. The response has not been emailed and no approval outcome is claimed.

## Follow-up clipboard verification

Actual keyboard copy and canvas paste were checked on 7 November 2026; see final-preflight.md. The earlier event-only limitation is now superseded for Chrome/macOS. Other browsers and OS remain untested.
