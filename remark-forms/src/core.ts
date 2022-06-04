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
import {Element as HastElements, Root} from "hast";
import {visit} from "unist-util-visit";
import {Code} from "mdast";
// @ts-ignore
import yaml from "js-yaml";
import {getRangeInput} from "./inputs/slider";
import {getInputWithType} from "./utils";
import {getTextInput, TextSchema} from "./inputs/text";
import {InputType, JSONSchema } from "./types";
import {getCurrencyInput, getQuantityInput} from "./inputs/quantity";
import {getLikertInput, isLikert, LikertSchema} from "./inputs/likert";
import {getRadioInput, isRadio, RadioSchema} from "./inputs/radio";
import {getToggleInput} from "./inputs/toggle";
import {CheckboxSchema, getCheckboxInput, isCheckbox} from "./inputs/checkbox";
import {Choice} from "./inputs/choice";
import {getAutocompleteInput} from "./inputs/autocomplete";
import {getSelectInput} from "./inputs/select";


/**
 * Note on "type":
 * JSON Schemas have a `type` property that corresponds to a basic JSON type
 * or one of our custom types.
 * Think primitives like "number", "boolean", "object", "array".
 *
 * This is *not* the same as the `type` attribute on an `<input/>` element.
 * This function maps the former to the latter. (Actually, we've broadened the
 * return type to also include non-`<input/>` inputs like `"textarea"` and
 * `"select"`.
 */
export const getInputType = (schema: JSONSchema): InputType => {
    if (isRadio(schema)) {
        if (schema.display?.variant === "dropdown") {
            return "select:one";
        } else if (schema.display?.variant === "autocomplete") {
            return "autocomplete";
        }
        return "radio";
    } else if (isCheckbox(schema)) {
        if (schema.display?.variant === "dropdown") {
            return "select:multiple";
        }
        return "checkbox";
    } else if (isLikert(schema)) {
        return "likert"
    } else if (schema.type === "string") {
        if (schema.format === "datetime") {
            return "datetime-local";
        } else if (schema.format === "tel") {
            return "tel";
        } else if (schema.format === "uri") {
            return "url";
        } else if (schema.format === "color") {
            return "color";
        }
        return "text";
    } else if (schema.type === "boolean") {
        return "toggle";
    } else if (schema.type === "array" || schema.type === "object" || schema.type === "null") {
        throw `Cannot convert schema of type ${schema.type} to a valid input type.`
    } else if (schema.type === "integer") {
        return "number";
    }

    return schema?.type;
}


/**
 * This returns a hast representation of the input for a given schema.
 *
 * TODO: We should enable a "plugin" approach where users can define
 *       their own custom schema types & inputs, and extend these
 *       defaults as they choose. It would also be much more elegant than this
 *       gross spaghetti tightly coupled crap.
 */
const getInput = (schema: JSONSchema): HastElements => {
    const type = getInputType(schema)

    switch (type) {
        case "radio":
            return getRadioInput(schema as RadioSchema);
        case "checkbox":
            return getCheckboxInput(schema as CheckboxSchema);
        case "select:one":
            return getSelectInput(schema, (schema as RadioSchema).enum);
        case "select:multiple":
            return getSelectInput(schema, (schema as CheckboxSchema).items.enum);
        case "autocomplete":
            return getAutocompleteInput(schema as RadioSchema);
        case "quantity":
            return getQuantityInput(schema);
        case "currency":
            return getCurrencyInput(schema);
        case "toggle":
            return getToggleInput(schema);
        case "range":
            return getRangeInput(schema);
        case "likert":
            return getLikertInput(schema as LikertSchema);
        case "text":
        case undefined:
            return getTextInput(schema as TextSchema)
    }

    return getInputWithType(schema, type);
}

export interface RemarkAskOptions {
    extensions?: any[]  // TODO: Separate custom inputs & load them in
    inputParser?: (s: string) => JSONSchema[],
    data?: Record<string, any>,
    codeBlockIdentifier?: string
}

export const remarkForms = (options?: RemarkAskOptions) => {
    // TODO: Default to json.loads & "input" instead of "question"
    const { codeBlockIdentifier = "question", inputParser = yaml.loadAll } = options ?? {};

  return (tree: Root) => {
    // @ts-ignore
    visit(tree, { lang: codeBlockIdentifier }, (node: Code) => {
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
  };
}
