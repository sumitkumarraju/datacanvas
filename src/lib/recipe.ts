import { ChartType, Dataset, DuplicatePolicy, LIMITS, MissingPolicy, Recipe, SortPolicy } from "../models/chart";

const chartTypes = new Set<ChartType>(["bar", "line", "pie"]);
const missingPolicies = new Set<MissingPolicy>(["error", "exclude"]);
const duplicatePolicies = new Set<DuplicatePolicy>(["separate", "sum", "average"]);
const sortPolicies = new Set<SortPolicy>(["source", "labelAsc", "valueDesc"]);

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && Object.getPrototypeOf(value) === Object.prototype;
}

function exactKeys(value: Record<string, unknown>, keys: string[], name: string): void {
    const actual = Object.keys(value).sort();
    const expected = [...keys].sort();
    if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
        throw new Error(`${name} contains unsupported fields.`);
    }
}

export function recipeFromJson(json: string): Recipe {
    let raw: unknown;
    try {
        raw = JSON.parse(json);
    } catch {
        throw new Error("Recipe is not valid JSON.");
    }
    if (!isRecord(raw)) throw new Error("Recipe must be an object.");
    exactKeys(raw, ["schemaVersion", "chartType", "columns", "rows", "mapping", "parse", "transform", "style", "size"], "Recipe");
    if (raw.schemaVersion !== 1 || typeof raw.chartType !== "string" || !chartTypes.has(raw.chartType as ChartType)) throw new Error("Unsupported recipe schema or chart type.");
    if (!Array.isArray(raw.columns) || !Array.isArray(raw.rows)) throw new Error("Recipe columns and rows are required.");
    if (raw.columns.length === 0 || raw.columns.length > LIMITS.maxColumns) throw new Error("Recipe must contain between 1 and 20 columns.");
    if (raw.rows.length > LIMITS.maxRows) throw new Error("Recipe contains more than 5,000 data rows.");
    const columns = raw.columns.map((column) => {
        if (!isRecord(column) || Object.keys(column).sort().join() !== "id,label" || typeof column.id !== "string" || typeof column.label !== "string") throw new Error("Recipe contains an invalid column.");
        if (column.label.trim() === "") throw new Error("Recipe column labels cannot be blank.");
        return { id: column.id, label: column.label };
    });
    if (new Set(columns.map((column) => column.id)).size !== columns.length) throw new Error("Recipe column IDs must be unique.");
    const rows = raw.rows.map((row) => {
        if (!Array.isArray(row) || row.length !== columns.length || row.some((cell) => typeof cell !== "string")) throw new Error("Recipe contains an invalid row.");
        return row;
    });
    const mapping = raw.mapping;
    if (!isRecord(mapping) || Object.keys(mapping).sort().join() !== "category,value" || typeof mapping.category !== "string" || typeof mapping.value !== "string") throw new Error("Recipe mapping is invalid.");
    if (!columns.some((column) => column.id === mapping.category) || !columns.some((column) => column.id === mapping.value)) throw new Error("Recipe mapping references an unknown column.");
    if (!isRecord(raw.parse) || Object.keys(raw.parse).sort().join() !== "locale,missing" || typeof raw.parse.locale !== "string" || !missingPolicies.has(raw.parse.missing as MissingPolicy)) throw new Error("Recipe parse settings are invalid.");
    if (!isRecord(raw.transform) || Object.keys(raw.transform).sort().join() !== "duplicates,sort" || !duplicatePolicies.has(raw.transform.duplicates as DuplicatePolicy) || !sortPolicies.has(raw.transform.sort as SortPolicy)) throw new Error("Recipe transform settings are invalid.");
    if (!isRecord(raw.style) || Object.keys(raw.style).sort().join() !== "background,colour,decimals,title" || typeof raw.style.title !== "string" || raw.style.title.length > 120 || typeof raw.style.colour !== "string" || !/^#[0-9a-f]{6}$/i.test(raw.style.colour) || typeof raw.style.background !== "string" || !/^#[0-9a-f]{6}$/i.test(raw.style.background) || typeof raw.style.decimals !== "number" || !Number.isInteger(raw.style.decimals) || raw.style.decimals < 0 || raw.style.decimals > 6) throw new Error("Recipe style settings are invalid.");
    if (!isRecord(raw.size) || Object.keys(raw.size).sort().join() !== "height,width" || typeof raw.size.width !== "number" || typeof raw.size.height !== "number" || !Number.isInteger(raw.size.width) || !Number.isInteger(raw.size.height) || raw.size.width < 1 || raw.size.width > 8192 || raw.size.height < 1 || raw.size.height > 8192) throw new Error("Recipe size is invalid.");
    return raw as unknown as Recipe;
}

export function recipeToJson(recipe: Recipe): string {
    return JSON.stringify(recipe, null, 2);
}

export function datasetFromRecipe(recipe: Recipe): Dataset {
    return { columns: recipe.columns, rows: recipe.rows };
}
