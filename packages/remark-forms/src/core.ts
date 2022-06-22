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
import {visit} from "unist-util-visit";
import yaml from "js-yaml";
import {parseFieldsets} from "./fieldset";
import {getInput} from "./inputs";
import type {Root} from "hast";
import type {Code} from "mdast";
import type {JSONSchema} from "./types";

export {update} from "./updates";


export interface RemarkFormOptions {
    extensions?: any[]  // TODO: Separate custom inputs & load them in
    inputParser?: (s: string) => JSONSchema[],
    data?: Record<string, any>,
    codeBlockIdentifier?: string
}

const parseInputBlocks = (tree: Root, options: RemarkFormOptions) => {
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

export const remarkForms = (options: RemarkFormOptions = {}) =>
    (tree: Root) => {
        parseInputBlocks(tree, options);
        parseFieldsets(tree);
    };
