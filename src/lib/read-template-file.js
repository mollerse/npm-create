import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * A helper function for reading files from the template directory.
 *
 * @param {string} file Filename of the templatefile you want to read
 * @returns {Promise<string>}
 */
export async function readTemplateFile(file) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const TEMPLATES_PATH = path.join(__dirname, "..", "templates");

  return readFile(path.join(TEMPLATES_PATH, file), { encoding: "utf-8" });
}
