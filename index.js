#!/usr/bin/env node

import inquirer from "inquirer";
import { writeFileSync } from "fs";
import { basename } from "path";
import { execSync } from "child_process";

function makeDevDeps(deps) {
  let ret = {};
  for (let pkg of deps) {
    let stdout = execSync(`npm info ${pkg} version`, { encoding: "utf-8" });
    ret[pkg] = stdout.trim();
  }

  return ret;
}

function defaultCss() {
  return `<style>
      * {
        box-sizing: border-box;
      }

      html,
      body {
        margin: 0;
        padding: 0;
        height: 100vh;
        width: 100vw;
        overflow: hidden;
        background: #050505;

        display: flex;
        justify-content: center;
        align-items: center;
      }

      body > * {
        margin: auto;
      }
  </style>`;
}

function indexHtml(name, entry) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1, maximum-scale=1, user-scalable=no"
    />
    <title>${name}</title>
    ${defaultCss()}
  </head>
  <body>
    <script type="module" src="${entry}" charset="utf-8"></script>
  </body>
</html>`;
}

function makePackageJson(
  answers,
  defaultDevDeps,
  prettierConfig,
  eslintConfig
) {
  let nonPlainDeps = ["vite"];
  let isPlain = answers.web !== "web";
  let devDeps = defaultDevDeps.filter((d) =>
    isPlain ? nonPlainDeps.indexOf(d) < 0 : true
  );

  let scripts = isPlain
    ? {
        start: `node ${answers.entry}`,
      }
    : {
        start: "vite",
        build: "vite build",
      };

  return JSON.stringify(
    {
      name: answers.name,
      version: answers.version,
      description: answers.desc,
      main: answers.entry,
      type: "module",
      scripts: scripts,
      keywords: answers.keywords.split(","),
      author: "Stian Møllersen <stian.moellersen@gmail.com>",
      license: answers.license,
      devDependencies: makeDevDeps(devDeps),
      prettier: prettierConfig,
      eslintConfig: eslintConfig,
    },
    null,
    2
  );
}

async function create(options) {
  let answers = await inquirer.prompt([
    {
      name: "name",
      message: "Pacakge name",
      default: () => basename(process.cwd()),
    },
    { name: "version", message: "Version", default: "1.0.0" },
    { name: "desc", message: "Description" },
    { name: "entry", message: "Entry point", default: "index.js" },
    { name: "repo", message: "git repository" },
    { name: "keywords", message: "Keywords" },
    { name: "license", message: "License", default: "CC-BY-NC-SA-4.0" },
    {
      name: "web",
      message: "Web or plain?",
      type: "list",
      choices: [
        { title: "Web", value: "web" },
        { title: "Plain", value: "plain" },
      ],
    },
  ]);
  console.log("Generating files...");

  let defaultDevDeps = ["prettier", "eslint", "vite"];

  let prettierConfig = {};
  let eslintConfig = {
    plugins: [],
    extends: ["eslint:recommended"],
    env: {
      browser: true,
    },
    parserOptions: {
      ecmaVersion: 8,
      sourceType: "module",
    },
  };

  writeFileSync(
    "package.json",
    makePackageJson(answers, defaultDevDeps, prettierConfig, eslintConfig)
  );

  let isPlain = answers.web !== "web";

  if (!isPlain) {
    writeFileSync("index.html", indexHtml(answers.name, answers.entry));
  }

  writeFileSync(`${answers.entry}`, "");

  console.log("Running npm install...");
  execSync("npm install --loglevel error", {
    stdio: "inherit",
    env: { ...process.env, ADBLOCK: "1", DISABLE_OPENCOLLECTIVE: "1" },
  });
  console.log("Running git init...");
  execSync("git init");
  execSync('touch .gitignore && echo "node_modules" >> .gitignore');
  execSync('git add . && git commit -m"Initial commit"');
  console.log("Done.");
}

await create();
