const fs = require("fs");
const path = require("path");
const esbuild = require("esbuild");

const rootPath = path.resolve(__dirname, "..");
const outputPath = path.join(rootPath, "lib");

fs.rmSync(outputPath, { recursive: true, force: true });

esbuild.buildSync({
  entryPoints: [path.join(rootPath, "src", "fs-plus.js")],
  outfile: path.join(outputPath, "fs-plus.js"),
  bundle: true,
  format: "cjs",
  platform: "node",
  sourcemap: true,
  target: "node24",
});
