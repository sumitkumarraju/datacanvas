# DataCanvas toolchain

Checked 26 October 2026.

| Tool | Version | Evidence |
|---|---:|---|
| Node.js | 26.7.0 | `node --version` |
| npm | 11.19.0 | `npm --version` |
| Adobe add-on CLI | 3.11.0 | `@adobe/create-ccweb-add-on`, `@adobe/ccweb-add-on-scripts` |
| TypeScript | 5.3.2 | `package.json` |
| React | 18.2.0 | `package.json` |

The project uses Adobe's `react-typescript` CLI scaffold, manifest version 2, Express API version 1, stable APIs only, and no document sandbox because DataCanvas inserts a generated PNG through the UI SDK.
