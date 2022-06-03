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
import {JSONSchema7, JSONSchema7TypeName} from "json-schema";
import {getQuantityInput, getRangeInput} from "./numeric";
import {getInputWithType} from "./utils";
import {
    CheckboxSchema,
    getCheckboxInput,
    getLikertInput,
    getRadioInput,
    getToggleInput,
    isCheckbox,
    isLikert,
    isRadio,
    LikertSchema,
    RadioSchema
} from "./choice";
import {getEmailInput, getTelInput, getURLInput} from "./contact";
import {getTextInput} from "./text";

export type CustomJSONSchemaTypeName = "quantity" | "range" | "datetime" | "date" | "time" | "email" | "file" |
    "url" | "tel";

export type JSONSchemaTypeName = JSONSchema7TypeName | CustomJSONSchemaTypeName;

export interface JSONSchema extends Omit<JSONSchema7, "type" | "$id"> {
    $id: string,
    type: JSONSchemaTypeName,
    placeholder?: string

    // type = "boolean"
    label?: string

    // type = "range" | "number"
    min?: number
    max?: number
    step?: number
    ticks?: boolean | number | (number | null)[]  // TODO: Use enum instead

    // Radios & Checkboxes
    variant?: "dropdown" | "autocomplete" | "button"

    // type = "quantity"
    units?: string
}

export type InputType = JSONSchemaTypeName | "radio" | "checkbox" | "likert" | undefined;



/**
 * Ok so the naming here is confusing.
 * `schema` has a `type` property that corresponds to a basic JSON type or one of our custom types above.
 * However, this is not the same as the "input type". For example, if we want to ask a user to submit
 * an answer out of a selection of options we can use a radio, a dropdown, or autocomplete.
 *
 * This returns the correct input type for a given (extended) JSON schema. It looks at both `schema.type`
 * and other fields.
 *
 * @param schema
 */
export const getInputType = (schema: JSONSchema): InputType => {
    if (isRadio(schema)) {
        return "radio";
    } else if (isCheckbox(schema)) {
        return "checkbox";
    } else if (isLikert(schema)) {
        return "likert"
    }

    return schema?.type;
}


const getInput = (schema: JSONSchema): HastElements => {
    switch (getInputType(schema)) {
        case "radio":
            return getRadioInput(schema as RadioSchema);
        case "checkbox":
            return getCheckboxInput(schema as CheckboxSchema);
        case "quantity":
            return getQuantityInput(schema);
        case "datetime":
            return getInputWithType(schema, "datetime-local");
        case "boolean":
            return getToggleInput(schema);
        case "range":
            return getRangeInput(schema);
        case "tel":
            return getTelInput(schema);
        case "email":
            return getEmailInput(schema);
        case "url":
            return getURLInput(schema);
        case "likert":
            return getLikertInput(schema as LikertSchema);
        case "string":
        case undefined:
            return getTextInput(schema)
    }
    return getInputWithType(schema, schema.type);
}

export interface RemarkAskOptions {
    extensions?: any[]  // TODO: Separate custom inputs & load them in
    questionParser?: (s: string) => JSONSchema[],
    data?: Record<string, any>
}

export const remarkAsk = (options?: RemarkAskOptions) => {
    // TODO Make this an optional dependency (default to JSON)
    const parser = options?.questionParser ?? yaml.loadAll;

  return (tree: Root) => {
    // @ts-ignore
    visit(tree, { lang: "question" }, (node: Code) => {
        // @ts-ignore
        const questions: JSONSchema[] = parser(node.value);
        const inputs = questions.map(getInput);

        // @ts-ignore
        node.type = "HTML";
        node.data = {
            hName: "div",
            hProperties: {
                className: ["form-row"],
                schema: questions
            },
            hChildren: inputs,
        }
    });
  };
}
