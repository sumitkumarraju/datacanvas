import { existsSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const dist = join(root, "dist");
const zip = join(root, "dist.zip");
const failures = [];
const requireFile = (file) => {
    if (!existsSync(file)) failures.push(`Missing required file: ${relative(root, file)}`);
};

requireFile(join(dist, "manifest.json"));
requireFile(join(dist, "index.html"));
requireFile(join(dist, "index.js"));
requireFile(zip);

const submissionAssets = [
    ["assets/datacanvas-icon-36.png", 36, 36],
    ["assets/datacanvas-icon-64.png", 64, 64],
    ["assets/datacanvas-icon.png", 144, 144],
    ["assets/datacanvas-screenshot-1.png", 1360, 800],
    ["assets/datacanvas-screenshot-2.png", 1360, 800],
    ["assets/datacanvas-screenshot-3.png", 1360, 800],
    ["assets/datacanvas-publisher-logo.png", 250, 250],
];
for (const [name, width, height] of submissionAssets) {
    const file = join(root, name);
    requireFile(file);
    if (existsSync(file)) {
        try {
            const identify = execFileSync("file", ["-b", file], { encoding: "utf8" });
            if (!identify.includes(`${width} x ${height}`)) failures.push(`${name} must be exactly ${width}x${height}; got ${identify.trim()}.`);
        } catch {
            failures.push(`Could not inspect submission asset: ${name}`);
        }
    }
}

if (existsSync(join(dist, "manifest.json"))) {
    let manifest;
    try {
        manifest = JSON.parse(readFileSync(join(dist, "manifest.json"), "utf8"));
    } catch {
        failures.push("dist/manifest.json is not valid JSON.");
    }
    if (manifest) {
        if (manifest.manifestVersion !== 2) failures.push("Manifest must use manifestVersion 2.");
        if (!/^\d+\.\d+\.\d+$/.test(manifest.version ?? "")) failures.push("Manifest version must be semantic major.minor.patch.");
        if (manifest.requirements?.experimentalApis) failures.push("Experimental APIs are not allowed in a submission package.");
        const entries = manifest.entryPoints ?? [];
        const ids = entries.map((entry) => entry.id);
        if (new Set(ids).size !== ids.length) failures.push("Manifest entry-point IDs must be unique.");
        for (const entry of entries) {
            if (!entry.main || entry.main.includes("..") || entry.main.startsWith("/")) failures.push(`Invalid entry-point path: ${entry.main}`);
            if (entry.main && !existsSync(join(dist, entry.main))) failures.push(`Entry-point file does not exist: ${entry.main}`);
        }
        if (manifest.name && manifest.name.length > 25) failures.push("Manifest development name exceeds Adobe's 25-character listing limit.");
    }
}

if (existsSync(dist)) {
    const bundle = readFileSync(join(dist, "index.js"), "utf8");
    for (const pattern of [/-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/, /AKIA[0-9A-Z]{16}/, /sk-[a-zA-Z0-9]{20,}/]) {
        if (pattern.test(bundle)) failures.push(`Possible secret detected in dist/index.js (${pattern}).`);
    }
}

if (existsSync(zip)) {
    if (statSync(zip).size > 50 * 1024 * 1024) failures.push("dist.zip exceeds Adobe's 50 MB package limit.");
    const entries = execFileSync("unzip", ["-Z1", zip], { encoding: "utf8" }).trim().split("\n").filter(Boolean);
    for (const entry of entries) {
        if (entry.startsWith("/") || entry.split("/").includes("..") || entry.split("/").some((part) => part.startsWith("."))) failures.push(`Unsafe ZIP path: ${entry}`);
    }
}

if (failures.length > 0) {
    console.error(failures.map((failure) => `FAIL: ${failure}`).join("\n"));
    process.exit(1);
}

console.log(JSON.stringify({ status: "passed", package: relative(root, zip), bytes: statSync(zip).size }, null, 2));
