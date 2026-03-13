const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const requiredFiles = [
  path.join(__dirname, "..", "build", "server.js"),
  path.join(__dirname, "..", "frontend", "public", "js", "game.js"),
];

const missingFiles = requiredFiles.filter(
  (filePath) => !fs.existsSync(filePath),
);

if (missingFiles.length === 0) {
  process.exit(0);
}

console.log("Missing build artifacts detected. Running npm run build...");

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const result = spawnSync(npmCommand, ["run", "build"], {
  cwd: path.join(__dirname, ".."),
  stdio: "inherit",
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
