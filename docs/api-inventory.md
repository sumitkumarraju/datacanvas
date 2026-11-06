# Adobe API inventory

| API | Use | Manifest permission | Stability evidence |
|---|---|---|---|
| `addOnUISdk.ready` | Wait for host readiness | None | Stable scaffold API |
| `addOnUISdk.app.document.addImage` | Insert the locally generated PNG | `allow-downloads` for the download action | Current Add-on UI SDK document reference |
| `addOnUISdk.app.ui.theme` | Read the current Express theme | None | Current UI SDK reference |
| `addOnUISdk.app.on/off("themechange")` | Keep the panel synchronized with light/dark theme changes | None | Current UI SDK reference; installed type package lacks this newer event name |

DataCanvas does not call experimental APIs, OAuth, network services, page capture, document renditions, or document-sandbox APIs. Drag-and-drop is intentionally omitted in v1; the supported primary interaction is **Add chart to Express** and the result is clearly described as a flat PNG.
