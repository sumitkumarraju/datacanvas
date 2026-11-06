export type ChartType = "bar" | "line" | "pie";
export type MissingPolicy = "error" | "exclude";
export type DuplicatePolicy = "separate" | "sum" | "average";
export type SortPolicy = "source" | "labelAsc" | "valueDesc";

export interface Column {
    id: string;
    label: string;
}

export interface Dataset {
    columns: Column[];
    rows: string[][];
}

export interface Recipe {
    schemaVersion: 1;
    chartType: ChartType;
    columns: Column[];
    rows: string[][];
    mapping: { category: string; value: string };
    parse: { locale: string; missing: MissingPolicy };
    transform: { duplicates: DuplicatePolicy; sort: SortPolicy };
    style: {
        title: string;
        colour: string;
        background: string;
        decimals: number;
    };
    size: { width: number; height: number };
}

export interface ChartPoint {
    label: string;
    value: number;
    valueText: string;
    sourceIndex: number;
}

export interface ChartSettings {
    chartType: ChartType;
    title: string;
    colour: string;
    background: string;
    decimals: number;
    width: number;
    height: number;
}

export interface DataError {
    row: number;
    field: string;
    message: string;
}

export interface ChartResult {
    points: ChartPoint[];
    errors: DataError[];
}

export const LIMITS = {
    maxBytes: 2 * 1024 * 1024,
    maxRows: 5000,
    maxColumns: 20,
    maxCategories: 100,
    maxPieSlices: 12,
} as const;
