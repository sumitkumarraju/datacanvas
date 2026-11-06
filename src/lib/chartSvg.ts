import { ChartPoint, ChartSettings } from "../models/chart";

function escapeXml(value: string): string {
    return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character] ?? character);
}

function rounded(value: number): string {
    return Number.isFinite(value) ? String(Math.round(value * 100) / 100) : "0";
}

export function buildChartSvg(points: ChartPoint[], settings: ChartSettings): string {
    const { width, height, background, colour, title, chartType, decimals } = settings;
    const margin = { top: 110, right: 60, bottom: 100, left: 100 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const max = Math.max(...points.map((point) => point.value), 0);
    const min = Math.min(...points.map((point) => point.value), 0);
    const range = max - min || 1;
    const format = (value: number) => value.toLocaleString("en-IN", { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
    const labels = points.map((point) => escapeXml(point.label));
    let content = "";

    if (chartType === "pie") {
        const total = points.reduce((sum, point) => sum + point.value, 0) || 1;
        let angle = -Math.PI / 2;
        const cx = width / 2;
        const cy = margin.top + chartHeight / 2;
        const radius = Math.min(chartWidth, chartHeight) * 0.36;
        content = points.map((point, index) => {
            const next = angle + (point.value / total) * Math.PI * 2;
            const largeArc = next - angle > Math.PI ? 1 : 0;
            const x1 = cx + radius * Math.cos(angle);
            const y1 = cy + radius * Math.sin(angle);
            const x2 = cx + radius * Math.cos(next);
            const y2 = cy + radius * Math.sin(next);
            const path = `M ${cx} ${cy} L ${rounded(x1)} ${rounded(y1)} A ${radius} ${radius} 0 ${largeArc} 1 ${rounded(x2)} ${rounded(y2)} Z`;
            angle = next;
            return `<path d="${path}" fill="${escapeXml(colour)}" opacity="${1 - index * 0.055}" aria-label="${labels[index]} ${format(point.value)}"/>`;
        }).join("");
    } else {
        const baseline = margin.top + ((max / range) * chartHeight);
        const step = chartWidth / Math.max(points.length, 1);
        const bars = points.map((point, index) => {
            const x = margin.left + index * step + step * 0.16;
            const barWidth = step * 0.68;
            const y = margin.top + ((max - point.value) / range) * chartHeight;
            const zeroY = baseline;
            const barHeight = Math.max(Math.abs(zeroY - y), 1);
            const rectY = point.value >= 0 ? y : zeroY;
            return `<rect x="${rounded(x)}" y="${rounded(rectY)}" width="${rounded(barWidth)}" height="${rounded(barHeight)}" rx="8" fill="${escapeXml(colour)}"><title>${labels[index]}: ${format(point.value)}</title></rect><text x="${rounded(x + barWidth / 2)}" y="${height - 45}" text-anchor="middle" class="label">${labels[index]}</text>`;
        }).join("");
        if (chartType === "line") {
            const line = points.map((point, index) => `${rounded(margin.left + index * step + step / 2)},${rounded(margin.top + ((max - point.value) / range) * chartHeight)}`).join(" ");
            content = `<polyline points="${line}" fill="none" stroke="${escapeXml(colour)}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>${points.map((point, index) => `<circle cx="${rounded(margin.left + index * step + step / 2)}" cy="${rounded(margin.top + ((max - point.value) / range) * chartHeight)}" r="12" fill="${escapeXml(colour)}"><title>${labels[index]}: ${format(point.value)}</title></circle><text x="${rounded(margin.left + index * step + step / 2)}" y="${height - 45}" text-anchor="middle" class="label">${labels[index]}</text>`).join("")}`;
        } else content = bars;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(title || "Chart")}"><style>.label{font:28px Arial,sans-serif;fill:#27313d}.title{font:bold 42px Arial,sans-serif;fill:#17202a}</style><rect width="100%" height="100%" fill="${escapeXml(background)}"/><text x="${margin.left}" y="65" class="title">${escapeXml(title || "Chart")}</text>${content}</svg>`;
}
