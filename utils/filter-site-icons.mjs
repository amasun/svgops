import { readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { optimize } from "svgo";

const root = process.cwd();
const assetsRoot = join(root, "static", "site-icons");
const dataRoot = join(root, "src", "data", "site-icons");
const apply = process.argv.includes("--apply");

const metadataFiles = new Map([
  ["monica", join(dataRoot, "monica.ts")],
  ["kimi", join(dataRoot, "kimi.ts")],
]);

const isProtectedAsset = (fileName) =>
  /(?:^|[-_])(logo|wordmark|brand)(?:[-_.]|$)/i.test(fileName);

const isAnimatedSvg = (source) =>
  /@keyframes\b|data-animation-icon\b|\banimation\s*:/i.test(source);

function normalizeSvg(source, filePath) {
  try {
    return optimize(source, {
      path: filePath,
      plugins: [
        "preset-default",
        {
          name: "removeAttrs",
          params: { attrs: ["class", "id", "style", "data-*"] },
        },
      ],
    }).data;
  } catch (error) {
    throw new Error(`无法解析 ${relative(root, filePath)}: ${error.message}`);
  }
}

function visibleElements(svg) {
  const elements = [];
  const tagPattern =
    /<(path|circle|ellipse|line|rect|polygon|polyline)\b([^>]*)\/?>(?:<\/\1>)?/gi;
  for (const match of svg.matchAll(tagPattern)) {
    const attributes = match[2];
    const data = attributes.match(/\bd\s*=\s*["']([^"']*)["']/i)?.[1] ?? "";
    elements.push({ tag: match[1].toLowerCase(), attributes, data });
  }
  return elements;
}

function commandSet(pathData) {
  return new Set(pathData.match(/[a-z]/gi) ?? []);
}

function isSimpleGeometry(svg) {
  const elements = visibleElements(svg);
  if (elements.length !== 1) return null;

  const [element] = elements;
  if (element.tag === "circle" || element.tag === "ellipse") {
    return "single circle";
  }
  if (element.tag === "line") return "single line";

  if (element.tag === "path") {
    const commands = commandSet(element.data);
    const commandCount = (element.data.match(/[a-z]/gi) ?? []).length;
    const moveCount = (element.data.match(/[Mm]/g) ?? []).length;
    const numberCount = (element.data.match(/-?(?:\d*\.\d+|\d+)/g) ?? [])
      .length;
    const circleCommands = [...commands].every((command) =>
      "MmAaCcSsZz".includes(command),
    );
    const lineCommands = [...commands].every((command) =>
      "MmLlHhVvZz".includes(command),
    );
    if (
      circleCommands &&
      moveCount === 1 &&
      (commands.has("a") || commands.has("A"))
    ) {
      return "single circle/dot path";
    }
    if (
      lineCommands &&
      moveCount === 1 &&
      numberCount >= 3 &&
      numberCount <= 4 &&
      commandCount <= 2
    )
      return "single line path";
    if (commandCount <= 1 && numberCount <= 2) return "single point path";
  }

  return null;
}

function findMatchingBrace(source, openIndex) {
  let depth = 0;
  let quote = null;
  for (let index = openIndex; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (character === quote && source[index - 1] !== "\\") quote = null;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === "{") depth += 1;
    if (character === "}" && --depth === 0) return index;
  }
  return -1;
}

function removeMetadataEntries(source, fileNames, siteId) {
  let result = source;
  const missing = [];

  for (const fileName of fileNames) {
    const fileNameLower = fileName.toLowerCase();
    const markerPattern = /originalFileName:\s*["']([^"']+)["']/g;
    const slugPattern = /slug:\s*["']([^"']+)["']/g;
    const originalNameMatch = [...result.matchAll(markerPattern)].find(
      (match) => match[1].toLowerCase() === fileNameLower,
    );
    const slugMatch = [...result.matchAll(slugPattern)].find(
      (match) => `${match[1].toLowerCase()}.svg` === fileNameLower,
    );
    const markerIndex = originalNameMatch?.index ?? slugMatch?.index ?? -1;
    if (markerIndex < 0) {
      missing.push(fileName);
      continue;
    }

    const isKimi = siteId === "kimi";
    const startMarker = isKimi ? "{" : "assetIcon({";
    const start = result.lastIndexOf(startMarker, markerIndex);
    const openBrace = isKimi ? start : start + "assetIcon(".length;
    const closeBrace = findMatchingBrace(result, openBrace);
    if (start < 0 || closeBrace < 0) {
      missing.push(fileName);
      continue;
    }

    let end = closeBrace + 1;
    if (!isKimi) {
      const closeCall = result.indexOf(")", end);
      if (closeCall >= 0) end = closeCall + 1;
    }
    if (result[end] === ",") end += 1;
    while (result[end] === "\r" || result[end] === "\n") end += 1;
    result = result.slice(0, start) + result.slice(end);
  }

  return { source: result, missing };
}

async function inspectSite(siteId, directory) {
  const entries = (await readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".svg"))
    .filter((entry) => !isProtectedAsset(entry.name))
    .sort((left, right) => left.name.localeCompare(right.name));
  const signatures = new Map();
  const findings = new Map();

  for (const entry of entries) {
    const filePath = join(directory, entry.name);
    const source = await readFile(filePath, "utf8");
    const normalized = normalizeSvg(source, filePath);
    const signature = `${isAnimatedSvg(source) ? "animated" : "static"}:${normalized}`;
    const duplicateOf = signatures.get(signature);
    if (duplicateOf) {
      const current = findings.get(entry.name) ?? [];
      current.push(`duplicate of ${duplicateOf}`);
      findings.set(entry.name, current);
    } else {
      signatures.set(signature, entry.name);
    }

    const simpleReason = isSimpleGeometry(normalized);
    if (simpleReason) {
      const current = findings.get(entry.name) ?? [];
      current.push(simpleReason);
      findings.set(entry.name, current);
    }
  }

  return { siteId, directory, findings };
}

async function main() {
  const siteEntries = (await readdir(assetsRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .sort((left, right) => left.name.localeCompare(right.name));
  const reports = [];

  for (const entry of siteEntries) {
    reports.push(await inspectSite(entry.name, join(assetsRoot, entry.name)));
  }

  const totalFindings = reports.reduce(
    (total, report) => total + report.findings.size,
    0,
  );
  if (totalFindings === 0) {
    console.log(
      "[filter-site-icons] No duplicate or overly simple icons found.",
    );
    return;
  }

  for (const report of reports) {
    if (report.findings.size === 0) continue;
    console.log(`\n${report.siteId}:`);
    for (const [fileName, reasons] of report.findings) {
      console.log(`- ${fileName}: ${reasons.join(", ")}`);
    }
  }

  if (!apply) {
    console.error(
      `\n[filter-site-icons] Found ${totalFindings} icon(s). Run ` +
        "pnpm filter:site-icons:apply" +
        " to remove them before building.",
    );
    process.exitCode = 1;
    return;
  }

  const pendingRemovals = [];
  const metadataUpdates = [];
  for (const report of reports) {
    if (report.findings.size === 0) continue;
    const fileNames = [...report.findings.keys()];
    const dataFile = metadataFiles.get(report.siteId);
    if (!dataFile) {
      throw new Error(`No metadata file configured for ${report.siteId}.`);
    }
    const metadata = await readFile(dataFile, "utf8");
    const updated = removeMetadataEntries(
      metadata,
      fileNames.map((name) => name),
      report.siteId,
    );
    if (updated.missing.length > 0) {
      throw new Error(
        `${report.siteId} metadata is missing: ${updated.missing.join(", ")}`,
      );
    }
    metadataUpdates.push({ dataFile, source: updated.source });
    pendingRemovals.push(
      ...fileNames.map((fileName) => ({
        directory: report.directory,
        fileName,
      })),
    );
  }

  for (const { dataFile, source } of metadataUpdates) {
    await writeFile(dataFile, source);
  }
  for (const { directory, fileName } of pendingRemovals) {
    await unlink(join(directory, fileName));
  }

  console.log(
    `\n[filter-site-icons] Removed ${pendingRemovals.length} icon(s).`,
  );
}

main().catch((error) => {
  console.error(`[filter-site-icons] ${error.message}`);
  process.exitCode = 1;
});
