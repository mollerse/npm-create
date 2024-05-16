import { exec as execCb } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execCb);

/** @type {string[]} */
export const DEPENDENCIES = [];

/** @type {string[]} */
export const DEV_DEPENDENCIES = ["prettier", "eslint", "@eslint/js", "globals"];

/** @type {Record.<string, number>} */
const MAJOR_FOR_DEPENDENCY = {
  vite: 5,
  eslint: 9,
  prettier: 3,
  "@eslint/js": 9,
  globals: 15,
  "@observablehq/framework": 1,
  "@observablehq/plot": 0.6,
};

/**
 * @param {string} dep
 */
async function getLatestVersionForDep(dep) {
  let maybeMajor = MAJOR_FOR_DEPENDENCY[dep];
  let major;
  if (!maybeMajor) {
    major = "latest";
  } else {
    major = maybeMajor;
  }

  let { stdout } = await exec(`npm info ${dep}@${major} version --json`);
  let versions = JSON.parse(stdout);
  if (Array.isArray(versions)) {
    return versions[versions.length - 1];
  } else {
    return versions;
  }
}

/**
 * @param {import("../types.js").Answers} answers
 * @param {{key: string, value: string}[]} scriptsRaw
 * @param {string[]} dependenciesRaw
 * @param {string[]} devDependenciesRaw
 * @returns
 */
export async function packageJson(answers, scriptsRaw, dependenciesRaw, devDependenciesRaw) {
  let dependencies = await Promise.all(
    dependenciesRaw.map(async (dep) => [dep, await getLatestVersionForDep(dep)]),
  );

  let devDependencies = await Promise.all(
    devDependenciesRaw.map(async (dep) => [dep, await getLatestVersionForDep(dep)]),
  );

  let scripts = scriptsRaw.map(({ key, value }) => [key, value]);

  return JSON.stringify(
    {
      name: answers.name,
      version: answers.version,
      description: answers.desc,
      main: answers.entry,
      type: "module",
      scripts: Object.fromEntries(scripts),
      keywords: answers.keywords.split(","),
      author: "Stian Møllersen <stian.moellersen@gmail.com>",
      license: answers.license,
      dependencies: Object.fromEntries(dependencies),
      devDependencies: Object.fromEntries(devDependencies),
    },
    null,
    2,
  );
}
