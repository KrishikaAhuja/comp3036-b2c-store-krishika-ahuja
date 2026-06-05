import { spawn } from "node:child_process";
import { copyFile, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const dbRoot = path.resolve(scriptDir, "..");
const sqliteSchemaPath = path.join(dbRoot, "prisma", "schema.prisma");
const postgresSchemaPath = path.join(dbRoot, "prisma", "schema.postgres.prisma");
const command = process.argv.slice(2).join(" ");

if (!command) {
  throw new Error("Usage: node with-postgres-schema.mjs <command>");
}

const originalSchema = await readFile(sqliteSchemaPath, "utf8");

function run(commandToRun) {
  return new Promise((resolve, reject) => {
    const child = spawn(commandToRun, {
      cwd: path.resolve(dbRoot, "../.."),
      shell: true,
      stdio: "inherit",
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}: ${commandToRun}`));
      }
    });
  });
}

try {
  await copyFile(postgresSchemaPath, sqliteSchemaPath);
  await run(command);
} finally {
  await writeFile(sqliteSchemaPath, originalSchema);
}
