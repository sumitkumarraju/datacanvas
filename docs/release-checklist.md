# DataCanvas release checklist

| Gate | Status | Evidence or owner |
|---|---|---|
| Local CSV parsing and chart workflow | implemented | `src/lib`, `src/components/App.tsx` |
| Data correctness fixtures | automated-tested | `test/datacanvas.test.ts` |
| Manifest/package validation | automated-tested | `scripts/validate-release.mjs`, `npm run release:check` |
| Production ZIP | generated | `dist.zip` |
| Adobe submission bundle | staged | `submission/` with package, listing assets, metadata, reviewer guide, fixture, and checksum |
| 144×144 listing icon | generated | `assets/datacanvas-icon.png` |
| 36×36 and 64×64 icon sizes | generated | `assets/datacanvas-icon-36.png`, `assets/datacanvas-icon-64.png` |
| 1360×800 listing screenshots | drafts generated | `assets/datacanvas-screenshot-1.png` through `assets/datacanvas-screenshot-3.png`; replace with real-host captures before submission |
| 250×250 publisher logo | draft generated | `assets/datacanvas-publisher-logo.png`; owner must confirm publisher ownership |
| Dark theme support | implemented | `App.tsx`, `App.css`; Adobe changelog checked 26 Oct 2026 |
| Dependency lockfile | implemented | `package-lock.json`, `npm ci` path documented |
| Adobe Express host insertion | blocked | Requires a real Adobe Express Add-on Development account and active document |
| Marketplace screenshot and host recording | blocked | Requires real-host verification; owner: QA |
| Listing account and name availability | blocked | Requires Adobe submission portal; owner: publisher |
| Legal operator, privacy, support and terms | blocked | Requires real operator details and qualified review |
| Adobe marketplace approval | not_started | Adobe submission decision |

The blocked items are external evidence gates, not claims of implementation failure.
