import assert from "node:assert/strict";
import test from "node:test";
import { buildChartData } from "../src/lib/chartData";
import { CsvParseError, parseCsv } from "../src/lib/csv";
import { recipeFromJson, recipeToJson } from "../src/lib/recipe";

test("parses BOM, quoted commas, quoted newlines and Unicode labels", () => {
    const dataset = parseCsv("\uFEFFA,B\n\"Punjabi, ਪੰਜਾਬੀ\",\"line 1\nline 2\"");
    assert.equal(dataset.columns[0].label, "A");
    assert.equal(dataset.rows[0][0], "Punjabi, ਪੰਜਾਬੀ");
    assert.equal(dataset.rows[0][1], "line 1\nline 2");
});

test("aggregates duplicate categories with exact decimal addition", () => {
    const dataset = parseCsv("A,B\nA,10\nA,20\nB,5");
    const result = buildChartData(dataset, "c1", "c2", "error", "sum", "source");
    assert.deepEqual(result.points.map((point) => [point.label, point.value]), [["A", 30], ["B", 5]]);
});

test("averages duplicate categories without changing source cells", () => {
    const dataset = parseCsv("A,B\nA,10\nA,20");
    const result = buildChartData(dataset, "c1", "c2", "error", "average", "source");
    assert.equal(result.points[0].value, 15);
    assert.deepEqual(dataset.rows, [["A", "10"], ["A", "20"]]);
});

test("reports row-specific errors and rejects non-finite numbers", () => {
    const dataset = parseCsv("A,B\nGood,10\nBlank,\nHuge,1e309\nText,nope");
    const result = buildChartData(dataset, "c1", "c2", "error", "separate", "source");
    assert.equal(result.points.length, 1);
    assert.deepEqual(result.errors.map((error) => error.row), [3, 4, 5]);
});

test("rejects malformed quoting and pie data with a negative value is visible to caller", () => {
    assert.throws(() => parseCsv("A,B\n\"broken,2"), CsvParseError);
    const dataset = parseCsv("A,B\nOne,-1\nTwo,4");
    const result = buildChartData(dataset, "c1", "c2", "error", "separate", "source");
    assert.equal(result.points.some((point) => point.value < 0), true);
});

test("recipe round-trip preserves mapping, styles and string cells", () => {
    const recipe = {
        schemaVersion: 1 as const,
        chartType: "bar" as const,
        columns: [{ id: "c1", label: "Month" }, { id: "c2", label: "Sales" }],
        rows: [["Jan", "120"]],
        mapping: { category: "c1", value: "c2" },
        parse: { locale: "en-IN", missing: "error" as const },
        transform: { duplicates: "sum" as const, sort: "source" as const },
        style: { title: "Sales", colour: "#2563EB", background: "#FFFFFF", decimals: 0 },
        size: { width: 1600, height: 900 },
    };
    assert.deepEqual(recipeFromJson(recipeToJson(recipe)), recipe);
});

test("recipe validation applies independent size and style limits", () => {
    const valid = {
        schemaVersion: 1,
        chartType: "bar",
        columns: [{ id: "c1", label: "A" }, { id: "c2", label: "B" }],
        rows: [["A", "1"]],
        mapping: { category: "c1", value: "c2" },
        parse: { locale: "en-IN", missing: "error" },
        transform: { duplicates: "separate", sort: "source" },
        style: { title: "Chart", colour: "#2563EB", background: "#FFFFFF", decimals: 0 },
        size: { width: 1600, height: 900 },
    };
    assert.doesNotThrow(() => recipeFromJson(JSON.stringify(valid)));
    assert.throws(() => recipeFromJson(JSON.stringify({ ...valid, size: { width: 0, height: 900 } })));
    assert.throws(() => recipeFromJson(JSON.stringify({ ...valid, style: { ...valid.style, colour: "red" } })));
});
