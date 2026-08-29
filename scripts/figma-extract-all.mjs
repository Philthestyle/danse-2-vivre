#!/usr/bin/env node
/**
 * Extraction complète du fichier Figma "Danse 2 Vivre".
 *
 * Fetch via l'API REST Figma :
 *   - fichier complet (tous les nœuds, sans limite de profondeur)
 *   - styles (couleurs, textes, effets, grilles)
 *   - components + component sets
 *   - image fills (images uploadées dans Figma)
 *   - PNG @2x de chaque frame top-level + composant
 *   - tokens-summary.json (couleurs + typos comptées)
 *
 * Downloads via https.get natif (évite les timeouts HTTP/2 undici sur les
 * URLs S3 renvoyées par Figma) + retry avec backoff.
 *
 * Usage : FIGMA_TOKEN=figd_... node scripts/figma-extract-all.mjs
 */
import { writeFileSync, existsSync, createWriteStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { get as httpsGet } from "node:https";

const TOKEN = process.env.FIGMA_TOKEN;
const FILE_KEY = process.env.FIGMA_FILE_KEY ?? "oe6hFdOBZuBWlOPdYhGDJp";
const DEST = process.env.FIGMA_DEST ?? `${process.env.HOME}/Desktop/Danse-2-Vivre-Figma`;

if (!TOKEN) {
  console.error("Manque FIGMA_TOKEN — export FIGMA_TOKEN=figd_... avant de lancer");
  process.exit(1);
}

async function figma(path) {
  const res = await fetch(`https://api.figma.com/v1${path}`, {
    headers: { "X-Figma-Token": TOKEN },
  });
  if (!res.ok) {
    throw new Error(`Figma API ${path} → ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

function downloadNative(url, dst, timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    const req = httpsGet(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadNative(res.headers.location, dst, timeoutMs).then(resolve, reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        res.resume();
        return;
      }
      const file = createWriteStream(dst);
      res.pipe(file);
      file.on("finish", () => file.close(() => resolve()));
      file.on("error", reject);
    });
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`timeout after ${timeoutMs}ms`));
    });
    req.on("error", reject);
  });
}

async function downloadWithRetry(url, dst, tries = 3) {
  for (let i = 1; i <= tries; i++) {
    try {
      await downloadNative(url, dst);
      return;
    } catch (err) {
      if (i === tries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * i));
    }
  }
}

function slug(s) {
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}

// 1. Fichier complet
console.log("▸ 1/6  Fetch fichier complet…");
const file = existsSync(`${DEST}/json/file.json`)
  ? JSON.parse(await readFile(`${DEST}/json/file.json`, "utf8"))
  : await figma(`/files/${FILE_KEY}?geometry=paths`);
if (!existsSync(`${DEST}/json/file.json`)) {
  writeFileSync(`${DEST}/json/file.json`, JSON.stringify(file, null, 2));
}
console.log(`  ✓ file.json — ${file.document.children.length} pages`);

// 2. Styles + components + fills
console.log("\n▸ 2/6  Fetch styles + components + fills…");
const [styles, comps, compSets, imageFills] = await Promise.all([
  figma(`/files/${FILE_KEY}/styles`),
  figma(`/files/${FILE_KEY}/components`),
  figma(`/files/${FILE_KEY}/component_sets`),
  figma(`/files/${FILE_KEY}/images`),
]);
writeFileSync(`${DEST}/json/styles.json`, JSON.stringify(styles, null, 2));
writeFileSync(`${DEST}/json/components.json`, JSON.stringify(comps, null, 2));
writeFileSync(`${DEST}/json/component_sets.json`, JSON.stringify(compSets, null, 2));
writeFileSync(`${DEST}/json/image-fills.json`, JSON.stringify(imageFills, null, 2));

// 3. Collecte nœuds à exporter
const framesToExport = [];
const componentsToExport = [];
for (const page of file.document.children) {
  for (const child of page.children ?? []) {
    if (child.type === "FRAME" || child.type === "SECTION") {
      framesToExport.push({ id: child.id, name: child.name, page: page.name });
    } else if (child.type === "COMPONENT" || child.type === "COMPONENT_SET") {
      componentsToExport.push({ id: child.id, name: child.name, page: page.name });
    }
  }
}
for (const cs of compSets.meta?.component_sets ?? []) {
  if (!componentsToExport.find((c) => c.id === cs.node_id)) {
    componentsToExport.push({ id: cs.node_id, name: cs.name, page: "components-registry" });
  }
}
for (const c of comps.meta?.components ?? []) {
  if (!componentsToExport.find((x) => x.id === c.node_id)) {
    componentsToExport.push({ id: c.node_id, name: c.name, page: "components-registry" });
  }
}
console.log(`\n▸ 3/6  ${framesToExport.length} frames + ${componentsToExport.length} composants`);

// 4-5. Export PNG (batchs de 5)
async function exportBatch(items, subdir, scale = 2) {
  const CHUNK = 5;
  for (let i = 0; i < items.length; i += CHUNK) {
    const batch = items.slice(i, i + CHUNK);
    const ids = batch.map((b) => b.id).join(",");
    console.log(`  → batch ${Math.floor(i / CHUNK) + 1}/${Math.ceil(items.length / CHUNK)}`);
    const res = await figma(`/images/${FILE_KEY}?ids=${ids}&format=png&scale=${scale}`);
    for (const b of batch) {
      const url = res.images?.[b.id];
      if (!url) continue;
      const filename = `${slug(b.page)}__${slug(b.name)}__${b.id.replace(":", "-")}.png`;
      const dst = `${DEST}/${subdir}/${filename}`;
      if (existsSync(dst)) {
        console.log(`    ↩ ${filename}`);
        continue;
      }
      try {
        await downloadWithRetry(url, dst);
        console.log(`    ✓ ${filename}`);
      } catch (err) {
        console.log(`    ✗ ${filename}: ${err.message}`);
      }
    }
  }
}

console.log("\n▸ 4/6  Export screens…");
await exportBatch(framesToExport, "screens", 2);
console.log("\n▸ 5/6  Export components…");
if (componentsToExport.length > 0) {
  await exportBatch(componentsToExport, "components", 2);
}

// 6. Tokens summary
console.log("\n▸ 6/6  Extraction tokens…");
const colors = new Map();
const typographies = new Map();
function walk(node) {
  if (!node) return;
  for (const fill of node.fills ?? []) {
    if (fill.type === "SOLID" && fill.color) {
      const { r, g, b } = fill.color;
      const hex = "#" + [r, g, b].map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("");
      const key = `${hex}_${(fill.opacity ?? 1).toFixed(2)}`;
      colors.set(key, {
        hex,
        rgb: { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) },
        opacity: fill.opacity ?? 1,
        count: (colors.get(key)?.count ?? 0) + 1,
      });
    }
  }
  if (node.style) {
    const key = `${node.style.fontFamily ?? "?"}_${node.style.fontWeight ?? "?"}_${node.style.fontSize ?? "?"}`;
    typographies.set(key, {
      fontFamily: node.style.fontFamily,
      fontWeight: node.style.fontWeight,
      fontSize: node.style.fontSize,
      lineHeight: node.style.lineHeightPx ?? node.style.lineHeightPercentFontSize ?? null,
      letterSpacing: node.style.letterSpacing,
      textCase: node.style.textCase,
      count: (typographies.get(key)?.count ?? 0) + 1,
    });
  }
  for (const c of node.children ?? []) walk(c);
}
walk(file.document);
writeFileSync(
  `${DEST}/json/tokens-summary.json`,
  JSON.stringify(
    {
      colors: [...colors.values()].sort((a, b) => b.count - a.count),
      typographies: [...typographies.values()].sort((a, b) => b.count - a.count),
    },
    null,
    2
  )
);

console.log(`\n✓ Terminé. Tout dans ${DEST}`);
