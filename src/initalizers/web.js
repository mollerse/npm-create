import { readTemplateFile } from "../lib/read-template-file.js";
import { DEPENDENCIES, DEV_DEPENDENCIES, packageJson as createPackageJson } from "./shared.js";

/** @type {import("../types.js").Initializer} */
export default async function (answers) {
  let indexJs = await readTemplateFile("index-waapi-clock.js");
  let indexHtmlRaw = await readTemplateFile("index.html");
  let indexCss = await readTemplateFile("index.css");
  let eslintConfig = await readTemplateFile("eslint.js");
  let prettierConfig = await readTemplateFile("prettier.js");
  let gitIgnore = await readTemplateFile("gitignore.txt");

  let entry = answers.entry;
  let name = answers.name;
  let css = indexCss;

  let indexHtml = indexHtmlRaw
    .replace("__name__", name)
    .replace("__entry__", entry)
    .replace("__css__", css);

  let dependencies = [...DEPENDENCIES];
  let devDependencies = [...DEV_DEPENDENCIES, "vite"];
  let scripts = [
    { key: "start", value: "vite" },
    { key: "build", value: "vite build" },
  ];

  let packageJson = await createPackageJson(answers, scripts, dependencies, devDependencies);

  return {
    sourceFiles: [
      { name: entry, content: indexJs },
      { name: "index.html", content: indexHtml },
      { name: "prettier.config.js", content: prettierConfig },
      { name: "eslint.config.js", content: eslintConfig },
      { name: ".gitignore", content: gitIgnore },
      { name: "package.json", content: packageJson },
    ],
  };
}
