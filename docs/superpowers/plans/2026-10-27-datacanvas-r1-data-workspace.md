# DataCanvas R1 Data Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace DataCanvas's single CSV-to-PNG data path with a validated local data workspace that supports CSV, paste, typed columns, quality issues, immutable revisions, and deterministic metrics.

**Architecture:** Keep the existing Adobe Express React/TypeScript scaffold. Add pure, host-independent modules for contracts, import, canonical data, and metrics; wire them into the existing panel only after their tests pass. Adobe SDK calls remain outside these modules. This plan is the first vertical slice of the approved R1 design; report composition, native insertion, projects, and refresh follow as separate plans.

**Tech Stack:** TypeScript 5.3, React 18, Node test runner through `tsx`, existing Adobe Express add-on scripts, no network services, no `eval`, and no new dependency until XLSX parser licensing and bundle behavior are reviewed.

---

## Existing files and boundaries

- Modify `src/lib/csv.ts`: preserve the tested CSV parser and expose bounded parsing metadata.
- Modify `src/models/chart.ts`: preserve chart compatibility while adding shared scalar/column types only where needed.
- Create `src/data/contracts.ts`: versioned dataset, column, quality, transformation, and metric contracts.
- Create `src/data/errors.ts`: safe structured errors without raw source values.
- Create `src/data/paste.ts`: tab/delimited paste parser that delegates to bounded CSV parsing.
- Create `src/data/revision.ts`: immutable dataset revision construction, type inference, canonical values, and content hash.
- Create `src/data/quality.ts`: quality issue classification and approval requirements.
- Create `src/metrics/decimal.ts`: decimal-safe string arithmetic for supported operations.
- Create `src/metrics/engine.ts`: allowlisted metric evaluation with provenance and null/zero guards.
- Create `src/metrics/schema.ts`: strict metric expression validation and depth limits.
- Modify `test/datacanvas.test.ts`: add meaningful data and metric acceptance tests.
- Create `test/data-workspace.test.ts`: boundary and contract tests for the new modules.
- Modify `src/components/App.tsx`: add a minimal Data/Quality/Metrics workspace without removing the existing chart workflow until the new flow is proven.
- Modify `src/components/App.css`: style the new workspace using existing Adobe Spectrum-compatible tokens.
- Create `docs/requirements.md`: map first-slice requirements to implementation and tests.
- Create `docs/data-semantics.md`: record parsing, types, nulls, units, periods, and rounding.
- Create `docs/adobe-capabilities.md`: record that this slice is host-independent and list native host gates for the next milestone.

The current repository has no Git metadata, so commit steps are replaced by file-level verification checkpoints.

## Limits for this slice

- CSV input: reject over 10 MiB before parsing, over 25,000 selected rows, or over 100 columns.
- Paste input: same row/column limits after parsing.
- Active datasets: one in the UI for this slice; the contract supports future project limits.
- Metric expression depth: maximum 12 nodes.
- No XLSX implementation in this slice. The UI must state that XLSX is a planned R1 input until a parser is selected and verified.
- No blanket zero-fill. Missing numeric values are error or exclude only.
- No locale guessing for ambiguous dates; date typing remains a quality warning until an explicit format is supplied.

### Task 1: Add versioned data contracts and safe errors

**Files:**
- Create: `src/data/contracts.ts`
- Create: `src/data/errors.ts`
- Test: `test/data-workspace.test.ts`

- [ ] **Step 1: Write failing contract tests**

Add tests that construct a valid revision and reject unknown fields, unsupported column types, invalid row widths, and unsafe nested values. Use strict Node assertions:

```ts
test("dataset revision accepts a valid versioned contract", () => {
    const revision = createDatasetRevision({
        sourceKind: "csv",
        sourceLabel: "campaign.csv",
        columns: [{ id: "c1", name: "Channel", type: "text" }],
        rawRows: [["Search"]],
    });
    assert.equal(revision.schemaVersion, 1);
    assert.equal(revision.columns[0].id, "c1");
});

test("contract validation rejects unknown fields and row-width mismatches", () => {
    assert.throws(() => parseDatasetRevision(JSON.stringify({ schemaVersion: 1, nope: true })));
    assert.throws(() => createDatasetRevision({
        sourceKind: "csv",
        sourceLabel: "bad.csv",
        columns: [{ id: "c1", name: "Value", type: "decimal" }],
        rawRows: [["1", "extra"]],
    }));
});
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `npm test -- --test-name-pattern="dataset revision|contract validation"`  
Expected: FAIL because `src/data/contracts.ts` does not exist.

- [ ] **Step 3: Implement strict contracts**

Define these exact types and functions:

```ts
export type ColumnType = "text" | "decimal" | "currency" | "percent" | "date" | "boolean";
export type Scalar = string | boolean | null;
export type SourceKind = "csv" | "paste";

export interface DatasetColumn { id: string; name: string; type: ColumnType; unit?: string; }
export interface QualityIssue {
    code: "MISSING_VALUE" | "INVALID_DECIMAL" | "AMBIGUOUS_DATE" | "MIXED_CURRENCY" | "DUPLICATE_KEY";
    severity: "error" | "warning" | "info";
    columnId?: string;
    rowIndex?: number;
    message: string;
}
export interface DatasetRevision {
    schemaVersion: 1;
    datasetId: string;
    revisionId: string;
    sourceKind: SourceKind;
    sourceLabel: string;
    importedAt: string;
    columns: DatasetColumn[];
    rawRows: string[][];
    canonicalRows: Scalar[][];
    transformations: [];
    qualityIssues: QualityIssue[];
    contentHash: string;
}

export function createDatasetRevision(input: {
    sourceKind: SourceKind;
    sourceLabel: string;
    columns: DatasetColumn[];
    rawRows: string[][];
}): DatasetRevision;
export function parseDatasetRevision(json: string): DatasetRevision;
```

Use exact-key validation, bounded string lengths, stable IDs, row-width checks, and `crypto.subtle`-free deterministic hashing compatible with browser and Node (`hashString` based on UTF-8 FNV-1a or a documented equivalent). Errors use `{ code, safeMessage, retryable, diagnosticId }` and never include raw cells.

- [ ] **Step 4: Run focused tests and confirm they pass**

Run: `npm test -- --test-name-pattern="dataset revision|contract validation"`  
Expected: PASS.

### Task 2: Harden bounded CSV and add paste parsing

**Files:**
- Modify: `src/lib/csv.ts`
- Create: `src/data/paste.ts`
- Modify: `test/data-workspace.test.ts`

- [ ] **Step 1: Add boundary tests**

Test BOM, quoted commas/newlines, Unicode, row/column limits, empty headers, pasted tab-separated data, and delimiter ambiguity. Include a 10 MiB boundary test using generated text without writing a temporary file.

- [ ] **Step 2: Run the focused tests and confirm the new boundaries fail**

Run: `npm test -- --test-name-pattern="CSV|paste|limit|delimiter"`  
Expected: existing parser tests pass while new limit/paste assertions fail.

- [ ] **Step 3: Implement bounded parsing**

Add exported limits and parse options:

```ts
export const DATA_LIMITS = {
    maxCsvBytes: 10 * 1024 * 1024,
    maxRows: 25_000,
    maxColumns: 100,
} as const;

export interface ParseOptions { delimiter?: "," | "\\t" | ";" | "|"; }
export function parsePaste(text: string): ParsedCsv;
export function detectDelimiter(text: string): ParseOptions["delimiter"] | "ambiguous";
```

Reject before allocating row arrays when the input byte count is too large. Reject blank/duplicate headers with row/column-safe messages. For paste, normalize tab-separated data and reuse the CSV state machine rather than creating a second quoting parser.

- [ ] **Step 4: Run all data parser tests**

Run: `npm test -- --test-name-pattern="parses|CSV|paste|limit|delimiter"`  
Expected: PASS, including the prior seven DataCanvas tests.

### Task 3: Build immutable revisions and quality reporting

**Files:**
- Create: `src/data/revision.ts`
- Create: `src/data/quality.ts`
- Modify: `test/data-workspace.test.ts`

- [ ] **Step 1: Write quality acceptance tests**

Cover decimal, currency, percent, boolean, and date inference; explicit missing-value policies; invalid numbers; ambiguous dates; immutable raw rows; and deterministic content hashes.

```ts
test("revision preserves raw cells while canonicalizing decimal values", () => {
    const revision = buildRevision({
        sourceKind: "csv", sourceLabel: "sales.csv",
        parsed: { columns: ["Amount"], rows: [["0.1"], ["0.2"]] },
        typeHints: { Amount: "currency" },
    });
    assert.deepEqual(revision.rawRows, [["0.1"], ["0.2"]]);
    assert.deepEqual(revision.canonicalRows, [["0.1"], ["0.2"]]);
    assert.equal(revision.qualityIssues.length, 0);
});

test("missing numeric values are reported and never silently become zero", () => {
    const revision = buildRevision({
        sourceKind: "paste", sourceLabel: "pasted table",
        parsed: { columns: ["Leads"], rows: [[""], ["12"]] },
        typeHints: { Leads: "decimal" },
    });
    assert.equal(revision.canonicalRows[0][0], null);
    assert.equal(revision.qualityIssues[0].code, "MISSING_VALUE");
});
```

- [ ] **Step 2: Run tests and confirm failure**

Run: `npm test -- --test-name-pattern="revision|canonical|missing numeric"`  
Expected: FAIL because revision builders are not implemented.

- [ ] **Step 3: Implement revision builder**

Implement `buildRevision({ sourceKind, sourceLabel, parsed, typeHints, missingPolicies })`. Keep `rawRows` copied and frozen at module boundaries. Infer only unambiguous types; require explicit date format for ambiguous date strings. Store currency unit from the type hint and emit `MIXED_CURRENCY` when values disagree. Return quality issues sorted by row then column.

- [ ] **Step 4: Run revision tests**

Run: `npm test -- --test-name-pattern="revision|canonical|missing numeric"`  
Expected: PASS.

### Task 4: Add decimal-safe metric expressions

**Files:**
- Create: `src/metrics/decimal.ts`
- Create: `src/metrics/schema.ts`
- Create: `src/metrics/engine.ts`
- Modify: `test/data-workspace.test.ts`

- [ ] **Step 1: Write numerical tests first**

Cover `0.1 + 0.2 = 0.3`, sum, count, average, weighted ratio, percentage change, zero denominator as `notComparable`, missing values, unsupported functions, circular references, and provenance.

```ts
test("metric engine calculates exact decimal sums", () => {
    const result = evaluateMetric(sumMetric("revenue", "revenue"), fixtureRevision);
    assert.equal(result.formatted, "0.30");
    assert.equal(result.canonical, "0.3");
    assert.deepEqual(result.provenance.sourceColumns, ["revenue"]);
});

test("safe divide reports zero denominator without infinity", () => {
    const result = evaluateMetric(safeDivideMetric("ctr", "clicks", "impressions"), fixtureRevision);
    assert.equal(result.status, "notComparable");
    assert.equal(result.canonical, null);
});
```

- [ ] **Step 2: Run focused metrics tests and confirm failure**

Run: `npm test -- --test-name-pattern="metric engine|decimal|divide|provenance"`  
Expected: FAIL because the metric modules are absent.

- [ ] **Step 3: Implement exact supported expression grammar**

Define:

```ts
export type ExpressionNode =
    | { kind: "sum" | "count" | "countDistinct" | "min" | "max" | "avg"; columnId: string }
    | { kind: "safeDivide"; numerator: ExpressionNode; denominator: ExpressionNode; onZero: "notComparable" | "zero" }
    | { kind: "percentageChange"; current: ExpressionNode; previous: ExpressionNode };

export interface MetricResult {
    status: "ok" | "notComparable" | "error";
    canonical: string | null;
    formatted: string;
    unit: string;
    provenance: { datasetRevisionId: string; sourceColumns: string[]; rowCount: number; expression: ExpressionNode };
}
```

Validate depth <= 12, referenced columns, compatible units, and no unknown keys before evaluation. Use scaled integer arithmetic or normalized decimal strings; never rely on binary floating point for currency/decimal aggregation. Round only when producing `formatted`.

- [ ] **Step 4: Run all metric tests**

Run: `npm test -- --test-name-pattern="metric engine|decimal|divide|provenance"`  
Expected: PASS.

### Task 5: Wire the first workspace screen into the panel

**Files:**
- Modify: `src/components/App.tsx`
- Modify: `src/components/App.css`
- Modify: `test/datacanvas.test.ts`

- [ ] **Step 1: Add UI behavior tests at the pure boundary**

Test that a valid parsed dataset produces a visible quality summary, missing values block chart creation until a policy is selected, and metric output displays its definition/provenance. Keep Adobe SDK calls mocked or absent in these tests.

- [ ] **Step 2: Implement staged Data/Quality/Metrics UI**

Add a compact tab/state model inside the existing panel:

```ts
type WorkspaceTab = "data" | "metrics";
type WorkspaceState = { tab: WorkspaceTab; revision: DatasetRevision | null; error: SafeDataError | null };
```

Retain the existing sample chart path as a compatibility preview, but make the new data workspace the visible first step. Add CSV import, paste textarea, type selectors, quality issue list, metric picker, and a disabled report action with the message that report composition arrives in the next milestone. Do not claim XLSX support in the UI.

- [ ] **Step 3: Verify the panel build and existing behavior**

Run: `npm test && npm run build`  
Expected: all tests pass and the Adobe production build completes.

### Task 6: Add requirements and semantics evidence

**Files:**
- Create: `docs/requirements.md`
- Create: `docs/data-semantics.md`
- Create: `docs/adobe-capabilities.md`
- Create: `docs/testing.md`

- [ ] **Step 1: Document implemented IDs and evidence**

Record these statuses accurately:

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| IMP01 | bounded CSV parsing | implemented | `src/lib/csv.ts`, parser tests |
| IMP03 | pasted table preview | implemented | `src/data/paste.ts`, workspace tests |
| IMP04 | immutable source cells and stable IDs | implemented | `src/data/revision.ts`, revision tests |
| CAL01 | deterministic aggregate metrics | implemented | `src/metrics/engine.ts`, metric tests |
| CAL02 | safe zero denominator | implemented | metric tests |
| XLSX01 | XLSX sheet/range import | blocked for next slice | parser selection/license review required |
| F01-F07 | Adobe native report gates | not_started | next milestone host evidence |

Document exact null, rounding, unit, date, and error semantics. Label test fixtures as synthetic and host checks as not yet performed for this slice.

- [ ] **Step 2: Run a documentation consistency scan**

Run: `grep -RniE 'TODO|TBD|fake|fully editable|XLSX supported' docs/requirements.md docs/data-semantics.md docs/adobe-capabilities.md docs/testing.md`  
Expected: no unresolved placeholders and no claim that XLSX/native report insertion is complete.

## Verification gate

Run from `/Users/skr/jarvis/datacanvas`:

```sh
npm ci
npm test
npm run build
npm run package
node scripts/validate-release.mjs
```

Expected: existing tests plus all new data/metric tests pass; production packaging and existing release validator pass. The next plan may begin only after this gate passes.

## Coverage after this plan

Implemented by this plan: CSV/paste data workspace, immutable revisions, quality reporting, deterministic metrics, and documentation. Deliberately deferred to the next plans: XLSX parser, report recipes/layout, native Express blocks, portable project ZIP, bindings, refresh conflicts, mutation recovery, and final R1 submission evidence.
