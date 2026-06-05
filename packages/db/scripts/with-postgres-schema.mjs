import { spawn } from "node:child_process";
import { copyFile, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const dbRoot = path.resolve(scriptDir, "..");
const sqliteSchemaPath = path.join(dbRoot, "prisma", "schema.prisma");
const postgresSchemaPath = path.join(dbRoot, "prisma", "schema.postgres.prisma");
const command = process.argv.slice(2).join(" ");
const require = createRequire(import.meta.url);

if (!command) {
  throw new Error("Usage: node with-postgres-schema.mjs <command>");
}

const originalSchema = await readFile(sqliteSchemaPath, "utf8");

function getProvider(schema) {
  const datasourceBlock = schema.match(/datasource\s+db\s*\{([\s\S]*?)\}/)?.[1] || "";

  return datasourceBlock.match(/provider\s*=\s*"([^"]+)"/)?.[1] || "";
}

async function assertActiveProvider(expectedProvider) {
  const activeSchema = await readFile(sqliteSchemaPath, "utf8");
  const activeProvider = getProvider(activeSchema);

  console.log(
    `[postgres-build] Active Prisma schema: ${sqliteSchemaPath}`,
  );
  console.log(`[postgres-build] Active Prisma provider: ${activeProvider}`);

  if (activeProvider !== expectedProvider) {
    throw new Error(
      `Expected Prisma provider "${expectedProvider}" but found "${activeProvider}" in schema.prisma`,
    );
  }
}

async function assertGeneratedClientProvider(expectedProvider) {
  const prismaClientEntry = require.resolve("@prisma/client");
  const prismaClientRoot = path.dirname(prismaClientEntry);
  const generatedSchemaPath = path.join(
    prismaClientRoot,
    "..",
    "..",
    ".prisma",
    "client",
    "schema.prisma",
  );
  const generatedSchema = await readFile(generatedSchemaPath, "utf8");
  const generatedProvider = getProvider(generatedSchema);

  console.log(
    `[postgres-build] Generated Prisma Client schema: ${generatedSchemaPath}`,
  );
  console.log(
    `[postgres-build] Generated Prisma Client provider: ${generatedProvider}`,
  );

  if (generatedProvider !== expectedProvider) {
    throw new Error(
      `Expected generated Prisma Client provider "${expectedProvider}" but found "${generatedProvider}"`,
    );
  }
}

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
  const postgresSchema = await readFile(postgresSchemaPath, "utf8");
  const postgresProvider = getProvider(postgresSchema);

  if (postgresProvider !== "postgresql") {
    throw new Error(
      `Expected schema.postgres.prisma to use provider "postgresql" but found "${postgresProvider}"`,
    );
  }

  await copyFile(postgresSchemaPath, sqliteSchemaPath);
  await assertActiveProvider("postgresql");
  await run("pnpm --filter @repo/db db:generate");
  await assertGeneratedClientProvider("postgresql");
  await run("pnpm --filter @repo/db build");
  await run(command);
} finally {
  await writeFile(sqliteSchemaPath, originalSchema);
  console.log("[postgres-build] Restored SQLite schema.prisma");
}
