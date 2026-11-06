import {
    ChartResult,
    Dataset,
    DuplicatePolicy,
    MissingPolicy,
    SortPolicy,
} from "../models/chart";

function decimalParts(value: string): { sign: bigint; digits: bigint; scale: number } {
    const trimmed = value.trim();
    const [coefficient, exponentText] = trimmed.toLowerCase().split("e");
    const exponent = exponentText ? Number(exponentText) : 0;
    const negative = coefficient.startsWith("-");
    const unsigned = coefficient.replace(/^[+-]/, "");
    const [whole, fraction = ""] = unsigned.split(".");
    const digitsText = `${whole}${fraction}`.replace(/^0+(?=\d)/, "") || "0";
    return {
        sign: negative ? -1n : 1n,
        digits: BigInt(digitsText),
        scale: fraction.length - exponent,
    };
}

function decimalToString(sign: bigint, digits: bigint, scale: number): string {
    if (digits === 0n) return "0";
    const raw = digits.toString();
    const padded = scale > 0 ? raw.padStart(scale + 1, "0") : raw;
    const split = scale > 0 ? padded.length - scale : padded.length;
    const result = scale > 0 ? `${padded.slice(0, split)}.${padded.slice(split)}` : `${padded}${"0".repeat(-scale)}`;
    return `${sign < 0n ? "-" : ""}${result.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "")}`;
}

function addDecimal(left: string, right: string): string {
    const a = decimalParts(left);
    const b = decimalParts(right);
    const scale = Math.max(a.scale, b.scale);
    const aValue = a.sign * a.digits * 10n ** BigInt(scale - a.scale);
    const bValue = b.sign * b.digits * 10n ** BigInt(scale - b.scale);
    const total = aValue + bValue;
    return decimalToString(total < 0n ? -1n : 1n, total < 0n ? -total : total, scale);
}

function parseFiniteNumber(raw: string): { value?: number; normalized?: string; missing?: boolean } {
    const normalized = raw.trim().replace(/,/g, "");
    if (normalized === "") return { missing: true };
    if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(normalized)) return {};
    const value = Number(normalized);
    if (!Number.isFinite(value)) return {};
    return { value, normalized };
}

export function buildChartData(
    dataset: Dataset,
    categoryId: string,
    valueId: string,
    missing: MissingPolicy,
    duplicates: DuplicatePolicy,
    sort: SortPolicy,
): ChartResult {
    const categoryIndex = dataset.columns.findIndex((column) => column.id === categoryId);
    const valueIndex = dataset.columns.findIndex((column) => column.id === valueId);
    if (categoryIndex < 0 || valueIndex < 0) return { points: [], errors: [{ row: 0, field: "mapping", message: "Choose both category and numeric columns." }] };

    const errors = [] as ChartResult["errors"];
    const rows: { label: string; value: number; valueText: string; sourceIndex: number }[] = [];
    dataset.rows.forEach((row, index) => {
        const label = row[categoryIndex]?.trim() ?? "";
        const parsed = parseFiniteNumber(row[valueIndex] ?? "");
        if (!label) {
            errors.push({ row: index + 2, field: dataset.columns[categoryIndex].label, message: "Category is blank." });
            return;
        }
        if (parsed.missing) {
            if (missing === "error") errors.push({ row: index + 2, field: dataset.columns[valueIndex].label, message: "Numeric value is blank." });
            return;
        }
        if (parsed.value === undefined || parsed.normalized === undefined) {
            errors.push({ row: index + 2, field: dataset.columns[valueIndex].label, message: "Value must be a finite number." });
            return;
        }
        rows.push({ label, value: parsed.value, valueText: parsed.normalized, sourceIndex: index });
    });

    let points = rows;
    if (duplicates !== "separate") {
        const groups = new Map<string, typeof rows>();
        rows.forEach((point) => groups.set(point.label, [...(groups.get(point.label) ?? []), point]));
        points = Array.from(groups, ([label, group]) => {
            const totalText = group.reduce((total, point) => addDecimal(total, point.valueText), "0");
            const valueText = duplicates === "average" ? String(Number(totalText) / group.length) : totalText;
            return { label, value: Number(valueText), valueText, sourceIndex: group[0].sourceIndex };
        });
    }

    if (sort === "labelAsc") points.sort((a, b) => a.label.localeCompare(b.label));
    if (sort === "valueDesc") points.sort((a, b) => b.value - a.value);
    if (points.length > 100) errors.push({ row: 0, field: "categories", message: "Bar and line charts support at most 100 categories." });
    return { points, errors };
}
