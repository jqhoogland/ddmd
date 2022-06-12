/**
 * # Support for forms... with markdown.
 *
 * Introduces a "question" code-block:
 *
 * ```question
 * title: Exercise
 * $id: exercise
 * description: "How much did you exercise today?"
 * type: number
 * required: true
 * default: 0
 * minimum: 0
 * ```
 *
 * The question block should be a yaml-encoding of a JSON schema.
 * In addition to the standard JSON schema fields, remark-ask also accepts
 * "icon".
 *
 * To have two inputs displayed next to each other, use `---` to separate yaml
 * pages.
 *
 * TODO:
 * - [] Add enum support (via datalist) for inputs other than radio/checkbox
 *
 */
import {Root} from "hast";
import {visit} from "unist-util-visit";
import {Code} from "mdast";
// @ts-ignore
import yaml from "js-yaml";
import {JSONSchema} from "./types";
import {parseFieldsets} from "./fieldset";
import {getInput} from "./inputs";

export {update} from "./updates";


export interface RemarkAskOptions {
    extensions?: any[]  // TODO: Separate custom inputs & load them in
    inputParser?: (s: string) => JSONSchema[],
    data?: Record<string, any>,
    codeBlockIdentifier?: string
}

const parseInputBlocks = (tree: Root, options: RemarkAskOptions) => {
    const {codeBlockIdentifier = "question", inputParser = yaml.loadAll} = options;

    visit(tree, {lang: codeBlockIdentifier}, (node: Code) => {
        // @ts-ignore
        const inputSchemas: JSONSchema[] = inputParser(node.value);
        const inputs = inputSchemas.map(getInput);

        // @ts-ignore
        node.type = "HTML";
        node.data = {
            hName: "div",
            hProperties: {
                className: ["form-row"],
                schema: inputSchemas
            },
            hChildren: inputs,
        }
    });
}

export const remarkForms = (options: RemarkAskOptions = {}) =>
    (tree: Root) => {
        parseInputBlocks(tree, options);
        parseFieldsets(tree);
    };
