import fs from "fs";
import path from "path";

const COMPONENTS_DIR = path.resolve(process.cwd(), "src/components");
const HARDCODED_CART_REGEX = /addToCart\s*\(\s*\d+/;

function findFiles(dir: string, extensions: string[]): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findFiles(fullPath, extensions));
    } else if (entry.isFile() && extensions.some((ext) => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }

  return results;
}

function runCheck(): void {
  const files = findFiles(COMPONENTS_DIR, [".ts", ".tsx"]);
  const violations: { file: string; line: number; text: string }[] = [];

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split("\n");

    lines.forEach((lineText, idx) => {
      if (HARDCODED_CART_REGEX.test(lineText)) {
        violations.push({
          file: path.relative(process.cwd(), file),
          line: idx + 1,
          text: lineText.trim(),
        });
      }
    });
  }

  if (violations.length > 0) {
    console.error(
      `❌ Error: Found ${violations.length} hardcoded addToCart(<numeric>) call(s) under src/components:\n`
    );
    for (const v of violations) {
      console.error(`  ${v.file}:${v.line} -> ${v.text}`);
    }
    process.exit(1);
  }

  console.log(
    `✅ Passed: 0 hardcoded addToCart(<numeric>) calls found across ${files.length} component files.`
  );
  process.exit(0);
}

runCheck();
