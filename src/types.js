/**
 * @typedef {"Web" | "Node" | "Notebook" | "Presentation"} ProjectType
 *
 * @typedef Answers
 * @property {string} name
 * @property {string} version
 * @property {string} desc
 * @property {string} entry
 * @property {string} repo
 * @property {string} keywords
 * @property {string} license
 * @property {Initializer} type
 *
 * @typedef InitializerDefinition
 * @property {{name: string, content: string}[]} sourceFiles
 *
 * @callback Initializer
 * @param {Answers} answers
 * @returns {Promise<InitializerDefinition>}
 */
