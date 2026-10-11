#!/usr/bin/env node
// Scaffold a new composition from src/compositions/_template and register it in Root.tsx.
// Usage: npm run new -- MyVideo

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const name = process.argv[2];

if (!name || !/^[A-Z][A-Za-z0-9]*$/.test(name)) {
  console.error("Usage: npm run new -- <PascalCaseName>   (e.g. npm run new -- ProductLaunch)");
  process.exit(1);
}

const dir = path.join(root, "src", "compositions", name);
if (fs.existsSync(dir)) {
  console.error(`src/compositions/${name} already exists.`);
  process.exit(1);
}

const template = fs.readFileSync(
  path.join(root, "src", "compositions", "_template", "Template.tsx"),
  "utf8",
);
const source = template
  .replace(/^\/\/ Template used by.*\n\n/m, "")
  .replaceAll("TemplateComp", name);

fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, `${name}.tsx`), source);

const rootFile = path.join(root, "src", "Root.tsx");
let rootSrc = fs.readFileSync(rootFile, "utf8");
const importMarker = "// @new-composition-imports";
const compMarker = "{/* @new-compositions";
if (!rootSrc.includes(importMarker) || !rootSrc.includes(compMarker)) {
  console.error("Could not find the @new-composition markers in src/Root.tsx. Register the composition manually.");
  process.exit(1);
}

rootSrc = rootSrc.replace(
  importMarker,
  `import { ${name}, ${name}Schema, ${name}_SECONDS } from "./compositions/${name}/${name}";\n${importMarker}`,
);
rootSrc = rootSrc.replace(
  compMarker,
  `<Composition
        id="${name}"
        component={${name}}
        {...VIDEO}
        durationInFrames={sec(${name}_SECONDS, VIDEO.fps)}
        schema={${name}Schema}
        defaultProps={{ title: "${name}", subtitle: "Edit src/compositions/${name}/${name}.tsx" }}
      />
      ${compMarker}`,
);
fs.writeFileSync(rootFile, rootSrc);

console.log(`Created src/compositions/${name}/${name}.tsx and registered "${name}" in src/Root.tsx.`);
console.log(`Preview: npm run dev   Render: npx remotion render ${name} out/${name}.mp4`);
