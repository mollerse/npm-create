#!/usr/bin/env node

import inquirer from "inquirer";
import { writeFile, mkdir } from "node:fs/promises";
import { basename, dirname } from "node:path";
import { exec as execCb } from "node:child_process";
import { promisify } from "node:util";

import { default as webInitializer } from "./initalizers/web.js";
import { default as nodeInitializer } from "./initalizers/node.js";
import { default as notebookInitializer } from "./initalizers/notebook.js";

const exec = promisify(execCb);

const DEFAULTS = {
  version: "1.0.0",
  entry: "index.js",
  lisence: "CC-BY-NC-SA-4.0",
};

/** @type {{name: import("./types.js").ProjectType, value: import("./types.js").Initializer}[]} */
const INITIALIZERS = [
  { name: "Web", value: webInitializer },
  { name: "Node", value: nodeInitializer },
  { name: "Notebook", value: notebookInitializer },
];

/**
 * @param {string} title
 * @param {string} task
 * @param {Object} options
 */
async function runTask(title, task, options = {}) {
  console.log(`Running "${title}"...`);
  try {
    let { stdout, stderr } = await exec(task, options);
    console.log(stdout);
    console.error(stderr);
  } catch (/** @type {any} */ err) {
    console.error(`Task "${title}" failed:`);
    console.error(err.mesasge);
  }
}

async function main() {
  /** @type {import("./types.js").Answers} */
  let answers = await inquirer.prompt([
    {
      name: "name",
      message: "Pacakge name",
      default: () => basename(process.cwd()),
    },
    { name: "version", message: "Version", default: DEFAULTS.version },
    { name: "desc", message: "Description" },
    { name: "entry", message: "Entry point", default: DEFAULTS.entry },
    { name: "repo", message: "git repository" },
    { name: "keywords", message: "Keywords" },
    { name: "license", message: "License", default: DEFAULTS.lisence },
    {
      name: "type",
      message: "Which type of project is this?",
      type: "list",
      choices: INITIALIZERS,
    },
  ]);

  console.log("Generating files...");

  let definition = await answers.type(answers);

  for (let file of definition.sourceFiles) {
    let filename = file.name;
    let maybeDir = dirname(filename);

    if (maybeDir && maybeDir !== ".") {
      await mkdir(maybeDir, { recursive: true });
    }

    await writeFile(file.name, file.content, { encoding: "utf-8" });
  }

  console.log();

  await runTask("Install dependencies", "npm install --loglevel error", {
    env: { ...process.env, ADBLOCK: "1", DISABLE_OPENCOLLECTIVE: "1" },
  });

  console.log();

  await runTask("Initialize git", "git init");

  console.log();

  await runTask("Creating initial commit", 'git add . && git commit -m"Initial commit"');

  console.log();

  console.log("Done.");
}

await main();
