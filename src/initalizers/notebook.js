import { readTemplateFile } from "../lib/read-template-file.js";
import { DEPENDENCIES, DEV_DEPENDENCIES, packageJson as createPackageJson } from "./shared.js";

/**
 * @param {import("../types.js").Answers} answers
 * @returns
 */
function observableConfig(answers) {
  return `export default {
  title: '${answers.name}',
  root: './src/',
  sidebar: true,
  pager: false,
  style: 'index.css',
  cleanUrls: true,
}`;
}

/** @type {import("../types.js").Initializer} */
export default async function (answers) {
  let indexCss = await readTemplateFile("index-notebook.css");
  let eslintConfig = await readTemplateFile("eslint.js");
  let prettierConfig = await readTemplateFile("prettier.js");
  let gitIgnore = await readTemplateFile("gitignore.txt");

  let dependencies = [...DEPENDENCIES];
  let devDependencies = [...DEV_DEPENDENCIES, "@observablehq/framework", "@observablehq/plot"];
  let scripts = [
    { key: "start", value: "observable preview" },
    { key: "build", value: "observable build" },
  ];

  let packageJson = await createPackageJson(answers, scripts, dependencies, devDependencies);

  return {
    sourceFiles: [
      { name: "index.css", content: indexCss },
      { name: "observablehq.config.js", content: observableConfig(answers) },
      { name: "prettier.config.js", content: prettierConfig },
      { name: "eslint.config.js", content: eslintConfig },
      { name: ".gitignore", content: gitIgnore },
      { name: "package.json", content: packageJson },
      { name: "src/index.md", content: "" },
    ],
  };
}
