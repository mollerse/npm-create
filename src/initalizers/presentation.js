import { readTemplateFile } from "../lib/read-template-file.js";
import { DEPENDENCIES, DEV_DEPENDENCIES, packageJson as createPackageJson } from "./shared.js";

/** @type {import("../types.js").Initializer} */
export default async function (answers) {
  let indexJs = await readTemplateFile("presentation/index.js");
  let indexHtmlRaw = await readTemplateFile("presentation/index.html");
  let indexCss = await readTemplateFile("presentation/index.css");
  let darculaCss = await readTemplateFile("presentation/darcula.css");
  let eslintConfig = await readTemplateFile("eslint.js");
  let prettierConfig = await readTemplateFile("prettier.js");
  let gitIgnore = await readTemplateFile("gitignore.txt");

  let entry = answers.entry;
  let name = answers.name;
  let css = indexCss;

  let indexHtml = indexHtmlRaw
    .replace(/__name__/g, name)
    .replace(/__entry__/g, entry)
    .replace(/__css__/g, css);

  let dependencies = [...DEPENDENCIES, "reveal.js"];
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
      { name: "lib/darcula.css", content: darculaCss },
      { name: "prettier.config.js", content: prettierConfig },
      { name: "eslint.config.js", content: eslintConfig },
      { name: ".gitignore", content: gitIgnore },
      { name: "package.json", content: packageJson },
    ],
  };
}
