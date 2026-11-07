# DataCanvas 1.0.1 — response to Adobe review

Prepared 7 November 2026. Draft response; not sent.

Hi Akash and CC Integrations Review Team,

Thank you for the detailed feedback. DataCanvas 1.0.1 addresses the six reported issues:

1. **UI copying/pasting:** Panel labels, table content and chart previews are no longer selectable or draggable. Copy/cut/drag events outside text-entry fields are prevented. Text fields retain normal editing. Supported chart insertion remains the explicit Add chart to Adobe Express action.
2. **Help:** Help now opens an accessible in-panel dialog with CSV import, mapping, chart creation, recipe, limits and support instructions. It includes a Close help button and Escape support.
3. **Export with data:** Replaced the sandbox-blocked browser confirmation with an in-panel confirmation dialog. Confirming downloads a JSON recipe containing the original source cells and chart settings. Cancelling does not export.
4. **Branding:** The action now reads “Add chart to Adobe Express”. Product references in UI and listing copy use the full product name. The manifest’s required machine identifier remains unchanged.
5. **No-data recipes:** Import now shows “Import CSV to continue”, explains that only settings were restored, and offers an Import original CSV action. Restored settings are separated in a collapsed disclosure. Mapping/style/chart controls are hidden, and Export with data is disabled, until source data is imported. Imported CSV columns must be checked before chart creation.
6. **Messages:** Operation notifications now appear near the top of the panel with a Dismiss button. Blocking validation and source-data guidance automatically disappear when the underlying condition is resolved.

Verification: all seven core tests and package validation pass. The production build was exercised inside signed-in Adobe Express in Chrome on macOS. Help, confirmation/cancellation, recipe download, notification dismissal, no-data gating, CSV restoration and chart insertion passed. The downloaded JSON was inspected and includes four sample source rows plus settings. Event-level checks confirmed UI copy protection and allowed text-field editing.

The corrected package is DataCanvas-1.0.1.zip. Updated real-host screenshots and verification notes accompany the resubmission materials.

Regards,
sumit kumar
