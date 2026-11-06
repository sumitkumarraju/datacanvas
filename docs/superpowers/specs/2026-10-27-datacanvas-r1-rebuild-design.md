# DataCanvas R1 Rebuild Design

**Date:** 27 October 2026  
**Status:** Approved design draft; implementation pending review  
**Product:** DataCanvas for Adobe Express  
**Owner:** Sumit Kumar

## Goal

Rebuild the existing DataCanvas add-on from its CSV-to-PNG workflow into the R1 product defined by the standalone specification. R1 must let a user import and validate local data, define deterministic metrics, compose a useful multi-page report, preview editability, insert supported native Express elements without clearing existing work, save a portable project, and refresh it with explicit conflict decisions.

R2 connectors and R3 AI features remain documented but disabled. The add-on must remain useful without an account, backend, connector, or AI provider.

## Acceptance criteria

1. A user can import CSV, paste a table, or inspect an XLSX sheet/range; the original cells remain immutable and quality issues are visible before generation.
2. A user can map typed fields and build supported deterministic metrics with safe null, unit, denominator, rounding, and provenance behavior.
3. A user can choose one of three R1 recipes, arrange report pages/blocks, preview the report, and see native/hybrid/image mode before insertion.
4. Supported KPI, text, rectangle, bar, table, target, narrative, and source-note blocks are generated through the document sandbox without clearing existing content.
5. A user can export/import a validated `.datacanvas` project with optional source data and recover the report recipe without fabricated data.
6. A user can import a replacement dataset, inspect numerical/structural changes and conflicts, cancel safely, then apply an approved refresh idempotently.
7. Failures remain recoverable and identify the affected stage/block. Partial host mutations are journaled and never reported as fully successful.
8. Automated tests cover numerical correctness, schemas, unsafe input, project boundaries, refresh behavior, accessibility, and narrow-panel behavior. Real Express evidence is tracked separately.

## Architecture

The existing Adobe scaffold remains the build boundary. React in the iframe owns navigation, import, preparation, metrics, preview, project files, and refresh plans. The document sandbox owns only host inspection and bounded mutation. A typed `HostAdapter` isolates Adobe APIs from product logic.

Proposed modules under the existing `src/` tree:

- `contracts`: versioned schemas and unified errors.
- `import`: CSV, paste, and bounded XLSX extraction.
- `data`: immutable dataset revisions, typing, transformations, and quality reports.
- `metrics`: allowlisted expression trees, decimal-safe calculations, periods, units, and provenance.
- `recipes`: R1 recipe definitions and block contracts.
- `layout`: page grid, safe margins, overflow checks, pagination, and scene graph.
- `renderers`: panel preview and native/hybrid/image render plans.
- `projects`: portable ZIP export/import, checksums, limits, and migrations.
- `bindings`: report/block/element identities, metadata, baselines, and ownership.
- `refresh`: three-way comparison, conflict decisions, mutation plans, journal, and recovery.
- `adobe`: typed host adapter, capability inventory, and document sandbox bridge.

The first implementation pass may keep modules close to the scaffold while boundaries stabilize. It must not make rendering recalculate metrics or pass executable code across the runtime bridge.

## Data contracts

All serialized contracts carry `schemaVersion` and reject unknown fields. Core records are:

- `DatasetRevision`: source kind/label, immutable raw cells, canonical values, stable column IDs/types, provenance, transformations, quality issues, and content hash.
- `MetricSpec`: ID, label, allowlisted expression, filters, unit, precision, null policy, period, and engine version.
- `BlockSpec`: block type, metric/dimension IDs, render mode, layout, style ID, and explicit overrides.
- `Binding`: report instance, block, element instance, role, dataset revision, generated baseline, ownership, and binding version.
- `ProjectManifest`: project/report IDs, revision IDs, recipe, style, page IDs, last applied revision, snapshot metadata, and data-inclusion flag.

Portable projects are ZIP containers with `project.json`, `datasets/`, `metrics.json`, `pages.json`, `styles.json`, `bindings.json`, and `checksums.json`. Paths are relative and validated. Size, entry count, decompressed size, JSON depth, and dataset limits are enforced.

## R1 product flow

Navigation uses Data, Metrics, Design, Refresh, and Projects. Help and Settings are secondary actions. Every area has empty, loading, valid, invalid, cancelled, partial-success, and recoverable-error states.

### Data

Support CSV, pasted delimited tables, and XLSX sheet/range selection. CSV limits are 10 MB, 25,000 selected rows, and 100 columns. XLSX limits are 15 MB compressed, 100 MB decompressed, 25,000 selected rows, and 100 columns. XLSX formulas are never executed; missing cached values are warnings requiring confirmation. Ambiguous dates, mixed currencies, missing values, and material exclusions require an explicit decision.

### Metrics

Support sum, count, count-distinct, minimum, maximum, average, weighted average, ratio, percentage change, and safe division. The expression grammar allows only the documented functions and field references; no `eval`, arbitrary JavaScript, recursion, network, filesystem, or host access. Canonical decimal results are preserved and formatted only at presentation.

### Design

Ship monthly campaign, sales performance, and one-page business infographic recipes. The core blocks are KPI, ranked bar, grouped bar, line, comparison table, target, narrative, and source note. Each block produces a scene graph and declares native/hybrid/image mode. The preview exposes pages, block ordering, source notes, data-quality status, overflow, and editability before insertion.

### Refresh

Load a candidate revision without changing the active report, remap fields, recalculate metrics, compare baseline/canvas/next state, show conflicts, and require approval. Offer Keep canvas, Use new data, Recreate block, and Disconnect binding. Revalidate immediately before mutation. Repeated Apply must not duplicate pages or marks.

### Projects

Save, export, import, duplicate without source data by default, restore snapshots, and clear local data. Dirty state offers Export, Discard, and Cancel before replacement. Local storage is treated as limited and recoverable through portable export, not as the sole source of truth.

## Adobe integration gates

Before enabling a capability, record its exact documented method, stability, permission, host evidence, and fallback. Required R1 gates are native text, shapes, pages, compact metadata, reopen/discovery, owned-element updates, conflict detection, and partial mutation recovery. Existing content is never cleared. Unsupported geometry remains explicitly hybrid/image and is not advertised as fully editable.

## Testing and release

Numerical tests precede visual tests. Fixtures cover quoted/Unicode CSV, messy data, XLSX cached/missing formulas, ambiguous dates, exact decimal sums, weighted rates, zero denominators, partial periods, long labels, large categories, missing bindings, duplicate bindings, stale canvas edits, repeated refresh, partial mutation, and unsafe archives.

Host tests are labeled as authenticated real-Express evidence or mock evidence. A mock cannot satisfy a host gate. Release artifacts include a versioned ZIP, checksum, SBOM, dependency/license record, requirements matrix, capability evidence, testing report, reviewer walkthrough, known limitations, and accurate marketplace metadata.

## Non-goals for R1

Google Sheets, cloud sync, scheduled refresh, AI storytelling, account services, team collaboration, joins, survey/impact/carousel recipes, automatic Brand Kit access, and unsupported native line/path/group operations are not activated in R1.

## Risks and decisions

- Native multi-page insertion, metadata persistence, reopen discovery, and recovery are host capability gates; failure produces a documented fallback or blocks the related R1 promise.
- XLSX support requires a maintained parser whose license, worker behavior, limits, and bundle impact are checked before adoption.
- Client storage may be cleared or quota-limited; portable project export is mandatory.
- Legal operator details, public help/privacy/terms URLs, publisher information, and Adobe approval remain external release decisions.
