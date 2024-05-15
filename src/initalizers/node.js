import { readTemplateFile } from "../lib/read-template-file.js";
import { DEPENDENCIES, DEV_DEPENDENCIES, packageJson as createPackageJson } from "./shared.js";

/** @type {import("../types.js").Initializer} */
export default async function (answers) {
  let indexJs = await readTemplateFile("index-node.js");
  let eslintConfig = await readTemplateFile("eslint.js");
  let prettierConfig = await readTemplateFile("prettier.js");
  let gitIgnore = await readTemplateFile("gitignore.txt");

  let entry = answers.entry;
  let dependencies = [...DEPENDENCIES];
  let devDependencies = [...DEV_DEPENDENCIES];
  let scripts = [
    { key: "start", value: `node ${entry}` },
    { key: "build", value: "vite build" },
  ];

  let packageJson = await createPackageJson(answers, scripts, dependencies, devDependencies);

  return {
    sourceFiles: [
      { name: entry, content: indexJs },
      { name: "prettier.config.js", content: prettierConfig },
      { name: "eslint.config.js", content: eslintConfig },
      { name: ".gitignore", content: gitIgnore },
      { name: "package.json", content: packageJson },
    ],
  };
}
