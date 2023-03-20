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
        color: #ebebeb;

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

function indexJs() {
  return `let ctx, actx, W, H;

function frame() {
  ctx.save();
  ctx.fillStyle = "#ebebeb";
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

let t0, tP;
function loop() {
  let totalT = actx.currentTime - t0;
  let deltaT = actx.currentTime - (tP || 0);

  requestAnimationFrame(loop);
  if (tP && deltaT < 0.033) {
    return;
  }

  tP = actx.currentTime;

  frame(totalT);
}

function init() {
  let canvas = document.createElement("canvas");
  canvas.setAttribute("width", \`\${0.75 * window.innerWidth}px\`);
  canvas.setAttribute("height", \`\${(9 / 16) * 0.75 * window.innerWidth}vw\`);
  document.body.appendChild(canvas);
  ctx = canvas.getContext("2d");
  actx = new AudioContext();

  W = canvas.width;
  H = canvas.height;

  t0 = actx.currentTime;

  let start = document.createElement("button");
  start.addEventListener("click", function () {
    if (actx.state === "suspended") {
      t0 = actx.currentTime;
      actx.resume();
      start.innerText = "Pause";
    }

    if (actx.state === "running") {
      actx.suspend();
      start.innerText = "Play";
    }
  });
  start.innerText = "Play";
  document.body.appendChild(start);

  frame(0);
}

init();
loop();
`;
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

  if (!isPlain) {
    writeFileSync(`${answers.entry}`, indexJs);
  } else {
    writeFileSync(`${answers.entry}`, "");
  }

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
