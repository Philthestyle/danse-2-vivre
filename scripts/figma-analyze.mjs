#!/usr/bin/env node
/**
 * Analyseur du file.json Figma → produit un DESIGN-SPEC.md exploitable
 * pour reconstruire l'UI au pixel près.
 *
 * Sortie : Danse-2-Vivre-Figma/DESIGN-SPEC.md + tokens.json
 */
import { readFileSync, writeFileSync } from "node:fs";

const ROOT = "/Users/fj-studios/.shikki/workspaces/personal/projects/WEB-allan-titin-danse-2-vivre/Danse-2-Vivre-Figma";
const file = JSON.parse(readFileSync(`${ROOT}/json/file.json`, "utf8"));

function rgba(color, opacity = 1) {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = color.a !== undefined ? color.a : opacity;
  if (a === 1) return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
}

const colors = new Map();
const typographies = new Map();
const effects = new Map();
const framesInventory = [];

function walk(node, path = []) {
  if (!node) return;
  const nodePath = [...path, node.name || node.type];

  // Fills
  for (const fill of node.fills ?? []) {
    if (fill.type === "SOLID" && fill.color) {
      const key = rgba(fill.color, fill.opacity ?? 1);
      colors.set(key, (colors.get(key) ?? 0) + 1);
    }
    if (fill.type === "GRADIENT_LINEAR" || fill.type === "GRADIENT_RADIAL") {
      const stops = fill.gradientStops
        ?.map((s) => rgba(s.color))
        .join(" → ");
      const key = `gradient(${fill.type}): ${stops}`;
      colors.set(key, (colors.get(key) ?? 0) + 1);
    }
  }
  // Strokes
  for (const stroke of node.strokes ?? []) {
    if (stroke.type === "SOLID" && stroke.color) {
      const key = `stroke: ${rgba(stroke.color, stroke.opacity ?? 1)}`;
      colors.set(key, (colors.get(key) ?? 0) + 1);
    }
  }

  // Text style
  if (node.style && node.type === "TEXT") {
    const key = JSON.stringify({
      family: node.style.fontFamily,
      weight: node.style.fontWeight,
      size: node.style.fontSize,
      lh:
        node.style.lineHeightPx ??
        (node.style.lineHeightPercentFontSize ? `${node.style.lineHeightPercentFontSize}%` : null),
      ls: node.style.letterSpacing,
      case: node.style.textCase,
    });
    typographies.set(key, (typographies.get(key) ?? 0) + 1);
  }

  // Effects (shadows, blurs)
  for (const eff of node.effects ?? []) {
    if (!eff.visible && eff.visible !== undefined) continue;
    const key = JSON.stringify({
      type: eff.type,
      radius: eff.radius,
      offset: eff.offset,
      color: eff.color ? rgba(eff.color, eff.color.a) : null,
      spread: eff.spread,
    });
    effects.set(key, (effects.get(key) ?? 0) + 1);
  }

  // Frames top-level → inventaire
  if (path.length === 2 && (node.type === "FRAME" || node.type === "SECTION")) {
    framesInventory.push({
      page: path[1] ?? path[0],
      name: node.name,
      id: node.id,
      size: node.absoluteBoundingBox
        ? {
            w: Math.round(node.absoluteBoundingBox.width),
            h: Math.round(node.absoluteBoundingBox.height),
          }
        : null,
      layoutMode: node.layoutMode,
      padding: {
        top: node.paddingTop,
        right: node.paddingRight,
        bottom: node.paddingBottom,
        left: node.paddingLeft,
      },
      itemSpacing: node.itemSpacing,
      background:
        (node.fills || []).find((f) => f.type === "SOLID")
          ? rgba(
              node.fills.find((f) => f.type === "SOLID").color,
              node.fills.find((f) => f.type === "SOLID").opacity ?? 1
            )
          : null,
      children: node.children?.length ?? 0,
    });
  }

  for (const c of node.children ?? []) walk(c, nodePath);
}

walk(file.document);

// Sort
const sortedColors = [...colors.entries()].sort((a, b) => b[1] - a[1]);
const sortedTypos = [...typographies.entries()]
  .sort((a, b) => b[1] - a[1])
  .map(([k, count]) => ({ ...JSON.parse(k), count }));
const sortedEffects = [...effects.entries()]
  .sort((a, b) => b[1] - a[1])
  .map(([k, count]) => ({ ...JSON.parse(k), count }));

// Fabriquer les tokens JSON (design tokens)
const tokens = {
  colors: sortedColors.map(([key, count]) => ({ value: key, count })),
  typography: sortedTypos,
  effects: sortedEffects,
  frames: framesInventory,
};
writeFileSync(`${ROOT}/tokens.json`, JSON.stringify(tokens, null, 2));

// Résumé lisible
let md = `# Danse 2 Vivre — Design spec extraite Figma\n\n`;
md += `> Généré par \`scripts/figma-analyze.mjs\` depuis \`json/file.json\`.\n\n`;
md += `## Palette utilisée (triée par fréquence)\n\n`;
md += `| Couleur / gradient | Usage |\n|---|---:|\n`;
for (const [key, count] of sortedColors.slice(0, 40)) {
  md += `| \`${key}\` | ${count} |\n`;
}
md += `\n## Typographies (${sortedTypos.length} variantes)\n\n`;
md += `| Famille | Poids | Taille | Line-height | Letter-spacing | Case | Usage |\n|---|---|---|---|---|---|---:|\n`;
for (const t of sortedTypos.slice(0, 30)) {
  md += `| ${t.family ?? "—"} | ${t.weight ?? "—"} | ${t.size ?? "—"}px | ${t.lh ?? "—"} | ${t.ls ?? "—"} | ${t.case ?? "—"} | ${t.count} |\n`;
}
md += `\n## Effets (ombres, blurs)\n\n`;
md += `| Type | Radius | Offset x/y | Color | Spread | Usage |\n|---|---|---|---|---|---:|\n`;
for (const e of sortedEffects) {
  md += `| ${e.type} | ${e.radius} | ${e.offset?.x ?? "—"}/${e.offset?.y ?? "—"} | ${e.color ?? "—"} | ${e.spread ?? "—"} | ${e.count} |\n`;
}
md += `\n## Frames de premier niveau (écrans)\n\n`;
md += `| Page | Nom | id | Taille | Layout | Padding | Gap | Background | Enfants |\n|---|---|---|---|---|---|---|---|---:|\n`;
for (const f of framesInventory) {
  const pad = f.padding
    ? `${f.padding.top ?? 0}/${f.padding.right ?? 0}/${f.padding.bottom ?? 0}/${f.padding.left ?? 0}`
    : "—";
  const size = f.size ? `${f.size.w}×${f.size.h}` : "—";
  md += `| ${f.page} | ${f.name} | ${f.id} | ${size} | ${f.layoutMode ?? "—"} | ${pad} | ${f.itemSpacing ?? "—"} | ${f.background ?? "—"} | ${f.children} |\n`;
}
writeFileSync(`${ROOT}/DESIGN-SPEC.md`, md);
console.log(`✓ DESIGN-SPEC.md + tokens.json → ${ROOT}`);
console.log(`  ${sortedColors.length} couleurs · ${sortedTypos.length} typos · ${sortedEffects.length} effets · ${framesInventory.length} frames`);
