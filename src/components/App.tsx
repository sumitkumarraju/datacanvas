// Spectrum theme fragments for the current Adobe Express light/dark themes.
// import these spectrum web components modules:
import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/express/theme-light.js";
import "@spectrum-web-components/theme/express/theme-dark.js";

// To learn more about using "swc-react" visit:
// https://opensource.adobe.com/spectrum-web-components/using-swc-react/
import { Theme } from "@swc-react/theme";
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

import { AddOnSDKAPI } from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";
import { buildChartData } from "../lib/chartData";
import { parseCsv, SAMPLE_CSV, CsvParseError } from "../lib/csv";
import { buildChartSvg } from "../lib/chartSvg";
import { datasetFromRecipe, recipeFromJson, recipeToJson } from "../lib/recipe";
import { ChartSettings, ChartType, Dataset, DuplicatePolicy, MissingPolicy, Recipe, SortPolicy } from "../models/chart";

const App = ({ addOnUISdk }: { addOnUISdk: AddOnSDKAPI }) => {
    const [dataset, setDataset] = useState<Dataset>(() => parseCsv(SAMPLE_CSV));
    const [sourceName, setSourceName] = useState("Built-in sample");
    const [categoryId, setCategoryId] = useState("c1");
    const [valueId, setValueId] = useState("c2");
    const [chartType, setChartType] = useState<ChartType>("bar");
    const [missing, setMissing] = useState<MissingPolicy>("error");
    const [duplicates, setDuplicates] = useState<DuplicatePolicy>("separate");
    const [sort, setSort] = useState<SortPolicy>("source");
    const [title, setTitle] = useState("Sales");
    const [colour, setColour] = useState("#2563EB");
    const [background, setBackground] = useState("#FFFFFF");
    const [decimals, setDecimals] = useState(0);
    const [message, setMessage] = useState("");
    const [modal, setModal] = useState<"help" | "export" | null>(null);
    const modalRef = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        if (modal) modalRef.current?.showModal();
        else modalRef.current?.close();
    }, [modal]);
    useEffect(() => {
        // Block copying panel chrome and chart previews into the host. Text
        // inputs retain normal editing, including keyboard copy/cut/paste.
        const protect = (event: Event) => {
            const target = event.composedPath()[0];
            if (target instanceof HTMLElement && target.closest('input, textarea')) return;
            event.preventDefault();
            event.stopPropagation();
        };
        for (const name of ["copy", "cut", "dragstart"]) document.addEventListener(name, protect, true);
        return () => { for (const name of ["copy", "cut", "dragstart"]) document.removeEventListener(name, protect, true); };
    }, []);
    const [busy, setBusy] = useState(false);
    const [needsReimport, setNeedsReimport] = useState(false);
    const [hostTheme, setHostTheme] = useState<"light" | "dark">(() => addOnUISdk.app.ui.theme === "dark" ? "dark" : "light");
    const fileInput = useRef<HTMLInputElement>(null);
    const recipeInput = useRef<HTMLInputElement>(null);
    const hostOperationInFlight = useRef(false);

    useEffect(() => {
        const handleThemeChange = (data: { theme?: string }) => {
            setHostTheme(data.theme === "dark" ? "dark" : "light");
        };
        // The current Adobe docs document themechange, while the installed SDK
        // declaration package has not yet added that event to AppEventType.
        const appEvents = addOnUISdk.app as unknown as {
            on: (name: "themechange", handler: (data: { theme?: string }) => void) => void;
            off: (name: "themechange", handler: (data: { theme?: string }) => void) => void;
        };
        appEvents.on("themechange", handleThemeChange);
        return () => appEvents.off("themechange", handleThemeChange);
    }, [addOnUISdk]);

    const result = useMemo(() => buildChartData(dataset, categoryId, valueId, missing, duplicates, sort), [dataset, categoryId, valueId, missing, duplicates, sort]);
    const settings: ChartSettings = { chartType, title, colour, background, decimals, width: 1600, height: 900 };
    const pieTotal = result.points.reduce((sum, point) => sum + point.value, 0);
    const pieInvalid = chartType === "pie" && (result.points.length > 12 || result.points.some((point) => point.value < 0) || pieTotal <= 0);
    const svg = useMemo(() => result.errors.length === 0 && result.points.length > 0 && !pieInvalid ? buildChartSvg(result.points, settings) : "", [result, settings, pieInvalid]);

    function loadCsv(file: File) {
        setBusy(true);
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const parsed = parseCsv(String(reader.result ?? ""));
                setDataset(parsed);
                setCategoryId(parsed.columns[0].id);
                setValueId(parsed.columns[1]?.id ?? parsed.columns[0].id);
                setSourceName(file.name);
                setNeedsReimport(false);
                setMessage(`Loaded ${file.name}: ${parsed.rows.length} rows and ${parsed.columns.length} columns.`);
            } catch (error) {
                setMessage(error instanceof CsvParseError ? error.message : "Could not read this CSV.");
            } finally {
                setBusy(false);
            }
        };
        reader.onerror = () => { setBusy(false); setMessage("Could not read this file."); };
        reader.readAsText(file, "utf-8");
    }

    function createRecipe(includeData: boolean): Recipe {
        return {
            schemaVersion: 1,
            chartType,
            columns: dataset.columns,
            rows: includeData ? dataset.rows : [],
            mapping: { category: categoryId, value: valueId },
            parse: { locale: "en-IN", missing },
            transform: { duplicates, sort },
            style: { title, colour, background, decimals },
            size: { width: 1600, height: 900 },
        };
    }

    function downloadText(filename: string, text: string, type: string) {
        const url = URL.createObjectURL(new Blob([text], { type }));
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 30000);
    }

    function exportRecipe(includeData: boolean) {
        if (includeData && (needsReimport || dataset.rows.length === 0)) { setMessage("Import the source CSV before exporting a recipe with data."); return; }
        downloadText(`datacanvas-${includeData ? "recipe" : "style"}.json`, recipeToJson(createRecipe(includeData)), "application/json");
        setMessage(includeData ? "Recipe exported with data." : "No-data recipe exported. Reimport the CSV before creating a chart.");
    }

    function loadRecipe(file: File) {
        setBusy(true);
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const recipe = recipeFromJson(String(reader.result ?? ""));
                setDataset(datasetFromRecipe(recipe));
                setCategoryId(recipe.mapping.category);
                setValueId(recipe.mapping.value);
                setChartType(recipe.chartType);
                setMissing(recipe.parse.missing);
                setDuplicates(recipe.transform.duplicates);
                setSort(recipe.transform.sort);
                setTitle(recipe.style.title);
                setColour(recipe.style.colour);
                setBackground(recipe.style.background);
                setDecimals(recipe.style.decimals);
                setNeedsReimport(recipe.rows.length === 0);
                setSourceName(file.name);
                setMessage(recipe.rows.length === 0 ? "Recipe loaded. Reimport the source CSV to restore its data." : "Recipe loaded.");
            } catch (error) {
                setMessage(error instanceof Error ? error.message : "Could not load this recipe.");
            } finally { setBusy(false); }
        };
        reader.onerror = () => { setBusy(false); setMessage("Could not read this recipe file."); };
        reader.readAsText(file, "utf-8");
    }

    function createPng(): Promise<Blob> {
        return new Promise((resolve, reject) => {
            const image = new Image();
            const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
            image.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = settings.width;
                canvas.height = settings.height;
                const context = canvas.getContext("2d");
                if (!context) { URL.revokeObjectURL(url); reject(new Error("Canvas is unavailable.")); return; }
                context.drawImage(image, 0, 0);
                URL.revokeObjectURL(url);
                canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("PNG creation failed.")), "image/png");
            };
            image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Chart rendering failed.")); };
            image.src = url;
        });
    }

    async function exportPng(insert: boolean) {
        if (hostOperationInFlight.current) return;
        if (needsReimport || !svg) { setMessage("Resolve the data errors before creating a chart."); return; }
        hostOperationInFlight.current = true;
        setBusy(true);
        try {
            const blob = await createPng();
            if (insert) {
                await addOnUISdk.app.document.addImage(blob, { title: title || "DataCanvas chart" });
                setMessage("Chart inserted into the current Adobe Express page as a flat PNG image.");
            } else {
                // Blob downloads need an object URL rather than text serialization.
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `datacanvas-${chartType}.png`;
                link.style.display = "none";
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.setTimeout(() => URL.revokeObjectURL(url), 30000);
                setMessage("PNG downloaded.");
            }
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "The chart operation failed.");
        } finally {
            hostOperationInFlight.current = false;
            setBusy(false);
        }
    }

    return (
        <Theme system="express" scale="medium" color={hostTheme}>
            <main className="container" data-theme={hostTheme}>
                <header className="header">
                    <div><p className="eyebrow">DATACANVAS</p><h1>Turn data into a chart</h1><p className="subtle">Your CSV stays in this add-on until you choose to export it.</p></div>
                    <button type="button" className="button secondary" onClick={() => setModal("help")}>Help</button>
                </header>

                {message && <div className="status notice" role="status" aria-live="polite"><span>{message}</span><button type="button" className="button secondary" aria-label="Dismiss notification" onClick={() => setMessage("")}>Dismiss</button></div>}
                <section className="card import-card" aria-labelledby="data-heading">
                    <div className="section-heading"><div><h2 id="data-heading">1. Add your data</h2><p className="subtle">UTF-8 CSV · up to 2 MB · 5,000 rows · 20 columns</p></div><span className="source-badge">{sourceName}</span></div>
                    <div className="button-row"><button type="button" className="button primary" onClick={() => fileInput.current?.click()} disabled={busy}>Import CSV</button><button type="button" className="button secondary" onClick={() => { const sample = parseCsv(SAMPLE_CSV); setDataset(sample); setCategoryId("c1"); setValueId("c2"); setSourceName("Built-in sample"); setNeedsReimport(false); setMessage("Built-in sample loaded."); }}>Use sample</button><input ref={fileInput} className="visually-hidden" type="file" accept=".csv,text/csv" aria-label="Import CSV file" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) loadCsv(file); }} /></div>
                    {needsReimport && <div className="notice warning"><h3>Import CSV to continue</h3><p>This recipe restored settings only, not source data. Chart creation and export with data are unavailable until you import the original CSV.</p><button type="button" className="button primary" onClick={() => fileInput.current?.click()} disabled={busy}>Import original CSV</button><details><summary>View restored recipe settings (no data)</summary><p>Chart: {chartType} · Title: {title || "Untitled"} · Sort: {sort} · Decimals: {decimals}</p><p>These saved settings will be available after import. Check the Category and Value mapping against the new CSV.</p></details></div>}
                    {!needsReimport && <div className="table-wrap"><table><caption className="visually-hidden">First twenty rows of imported data</caption><thead><tr>{dataset.columns.map((column) => <th key={column.id} scope="col">{column.label}</th>)}</tr></thead><tbody>{dataset.rows.slice(0, 20).map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>)}</tr>)}</tbody></table></div>}
                </section>

                {!needsReimport && <>
                <section className="card" aria-labelledby="map-heading"><h2 id="map-heading">2. Map your chart</h2><div className="form-grid"><label>Category<select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>{dataset.columns.map((column) => <option key={column.id} value={column.id}>{column.label}</option>)}</select></label><label>Value<select value={valueId} onChange={(event) => setValueId(event.target.value)}>{dataset.columns.map((column) => <option key={column.id} value={column.id}>{column.label}</option>)}</select></label><label>Chart type<select value={chartType} onChange={(event) => setChartType(event.target.value as ChartType)}><option value="bar">Bar</option><option value="line">Line</option><option value="pie">Pie</option></select></label><label>Missing values<select value={missing} onChange={(event) => setMissing(event.target.value as MissingPolicy)}><option value="error">Show errors</option><option value="exclude">Exclude rows</option></select></label><label>Duplicate categories<select value={duplicates} onChange={(event) => setDuplicates(event.target.value as DuplicatePolicy)}><option value="separate">Keep separate</option><option value="sum">Sum values</option><option value="average">Average values</option></select></label><label>Sort<select value={sort} onChange={(event) => setSort(event.target.value as SortPolicy)}><option value="source">Source order</option><option value="labelAsc">Label A–Z</option><option value="valueDesc">Value high–low</option></select></label></div>{result.errors.length > 0 && <div className="errors" role="alert"><strong>Resolve these data issues before charting:</strong><ul>{result.errors.slice(0, 8).map((error, index) => <li key={`${error.row}-${index}`}>Row {error.row}, {error.field}: {error.message}</li>)}</ul>{result.errors.length > 8 && <p>And {result.errors.length - 8} more.</p>}</div>}{chartType === "pie" && pieInvalid && <p className="notice error">Pie charts require up to 12 non-negative values and a positive total.</p>}</section>

                <section className="card" aria-labelledby="style-heading"><h2 id="style-heading">3. Style and create</h2><div className="form-grid style-grid"><label className="wide">Title<input value={title} maxLength={120} onChange={(event) => setTitle(event.target.value)} /></label><label>Chart colour<input type="color" value={colour} onChange={(event) => setColour(event.target.value)} /></label><label>Background<input type="color" value={background} onChange={(event) => setBackground(event.target.value)} /></label><label>Decimals<input type="number" min="0" max="6" value={decimals} onChange={(event) => setDecimals(Math.min(6, Math.max(0, Number(event.target.value) || 0)))} /></label></div><div className="chart-frame">{svg ? <div className="chart-image" dangerouslySetInnerHTML={{ __html: svg }} /> : <div className="empty-chart">A valid chart preview will appear here.</div>}</div>{svg && <div className="summary"><strong>Accessible data summary</strong><span>{result.points.length} categories · total {result.points.reduce((sum, point) => sum + point.value, 0).toLocaleString("en-IN", { maximumFractionDigits: decimals })}</span>{result.points.slice(0, 8).map((point) => <span key={`${point.label}-${point.sourceIndex}`}>{point.label}: {point.value.toLocaleString("en-IN", { maximumFractionDigits: decimals })}</span>)}</div>}<div className="button-row action-row"><button type="button" className="button primary" disabled={!svg || busy} onClick={() => exportPng(true)}>Add chart to Adobe Express</button><button type="button" className="button secondary" disabled={!svg || busy} onClick={() => exportPng(false)}>Download PNG</button></div><p className="subtle flat-note">The inserted result is a flat PNG. Keep the recipe below as the editable source.</p></section>

                </>}
                <section className="card" aria-labelledby="recipe-heading"><div className="section-heading"><div><h2 id="recipe-heading">Recipes</h2><p className="subtle">Recipes preserve mapping, transformations and styles for later editing.</p></div><button type="button" className="button secondary" onClick={() => recipeInput.current?.click()}>Import recipe</button><input ref={recipeInput} className="visually-hidden" type="file" accept="application/json,.json" aria-label="Import recipe file" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) loadRecipe(file); }} /></div><div className="button-row"><button type="button" className="button secondary" disabled={busy || needsReimport || dataset.rows.length === 0} onClick={() => setModal("export")}>Export with data</button><button type="button" className="button secondary" onClick={() => exportRecipe(false)}>Export no-data recipe</button></div></section>
                <dialog ref={modalRef} className="help-dialog" onCancel={() => setModal(null)} aria-labelledby="dialog-heading">
                    <h2 id="dialog-heading">{modal === "help" ? "DataCanvas help" : "Export recipe with source data?"}</h2>
                    {modal === "help" ? <><ol><li>Import a UTF-8 CSV or try the built-in sample.</li><li>Select Category and Value columns, then choose a chart type. Resolve any data errors.</li><li>Set your title, colours and number format.</li><li>Select Add chart to Adobe Express to insert a flat PNG, or Download PNG to save it.</li></ol><p>Recipes preserve chart settings. Export with data includes the original CSV cells; keep the file private. A no-data recipe requires importing the original CSV before chart creation.</p><p>Limits: 2 MB CSV, 5,000 rows, 20 columns. Pie charts support up to 12 non-negative values with a positive total.</p><p>Support: sumitts317@gmail.com</p></> : <p>This JSON file includes your original CSV cells and chart settings. It may contain sensitive data. Only export it if you intend to save that data to your device.</p>}
                    <div className="button-row"><button autoFocus type="button" className="button secondary" onClick={() => setModal(null)}>{modal === "help" ? "Close help" : "Cancel"}</button>{modal === "export" && <button type="button" className="button primary" onClick={() => { exportRecipe(true); setModal(null); }}>Download recipe with data</button>}</div>
                </dialog>
            </main>
        </Theme>
    );
};

export default App;
