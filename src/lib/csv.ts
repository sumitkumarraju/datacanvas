import { Column, Dataset, LIMITS } from "../models/chart";

export class CsvParseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "CsvParseError";
    }
}

function byteLength(value: string): number {
    return new TextEncoder().encode(value).byteLength;
}

/** Parse RFC 4180-style CSV without evaluating formula-like cell content. */
export function parseCsv(input: string): Dataset {
    if (byteLength(input) > LIMITS.maxBytes) {
        throw new CsvParseError("CSV is larger than the 2 MB limit.");
    }

    const source = input.replace(/^\uFEFF/, "");
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = "";
    let quoted = false;
    let justClosedQuote = false;

    for (let index = 0; index < source.length; index += 1) {
        const character = source[index];
        const next = source[index + 1];

        if (quoted) {
            if (character === '"' && next === '"') {
                cell += '"';
                index += 1;
            } else if (character === '"') {
                quoted = false;
                justClosedQuote = true;
            } else {
                cell += character;
            }
            continue;
        }

        if (character === '"') {
            if (cell.length > 0 || justClosedQuote) {
                throw new CsvParseError(`Unexpected quote near character ${index + 1}.`);
            }
            quoted = true;
            continue;
        }

        if (justClosedQuote && character !== "," && character !== "\n" && character !== "\r") {
            throw new CsvParseError(`Unexpected character after a quoted field near ${index + 1}.`);
        }

        if (character === ",") {
            row.push(cell);
            cell = "";
            justClosedQuote = false;
        } else if (character === "\n" || character === "\r") {
            row.push(cell);
            rows.push(row);
            row = [];
            cell = "";
            justClosedQuote = false;
            if (character === "\r" && next === "\n") index += 1;
        } else {
            cell += character;
            justClosedQuote = false;
        }
    }

    if (quoted) throw new CsvParseError("CSV contains an unterminated quoted field.");
    if (cell.length > 0 || row.length > 0 || source.endsWith(",")) {
        row.push(cell);
        rows.push(row);
    }

    while (rows.length > 0 && rows[rows.length - 1].every((value) => value === "")) rows.pop();
    if (rows.length < 2) throw new CsvParseError("CSV must include a header and at least one data row.");
    if (rows.length - 1 > LIMITS.maxRows) throw new CsvParseError("CSV contains more than 5,000 data rows.");

    const header = rows[0];
    if (header.length === 0 || header.length > LIMITS.maxColumns) {
        throw new CsvParseError("CSV must contain between 1 and 20 columns.");
    }
    if (header.some((label) => label.trim() === "")) throw new CsvParseError("Column labels cannot be blank.");

    const columns: Column[] = header.map((label, index) => ({ id: `c${index + 1}`, label }));
    const normalizedRows = rows.slice(1).map((values, rowIndex) => {
        if (values.length !== columns.length) {
            throw new CsvParseError(`Row ${rowIndex + 2} has ${values.length} fields; expected ${columns.length}.`);
        }
        return values;
    });

    return { columns, rows: normalizedRows };
}

export const SAMPLE_CSV = `Month,Sales\nJan,120\nFeb,180\nMar,145\nApr,220`;
