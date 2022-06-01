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
 */
import {Root, Element as HastElements} from "hast";
import {visit} from "unist-util-visit";
import {Code} from "mdast";
import {h} from "hastscript";
// @ts-ignore
import yaml from "js-yaml";
import {JSONSchema7, JSONSchema7Type, JSONSchema7TypeName} from "json-schema";
import {HTMLInputTypeAttribute} from "react";
import {isBoolean} from "util";
import {HChild} from "hastscript/lib/core";

type CustomJSONSchemaTypeName = "quantity" | "range" | "datetime" | "date" | "time" | "duration" | "email" | "file" |
    "url" | "tel";

type JSONSchemaTypeName = JSONSchema7TypeName | CustomJSONSchemaTypeName;

interface JSONSchema extends Omit<JSONSchema7, "type"> {
    type: JSONSchemaTypeName,
    placeholder?: string

    // Boolean toggles
    label?: string

    // Ranges
    min?: number
    max?: number
    step?: number
    ticks?: boolean | number | (number | null)[]

    // Radios & Checkboxes
    variant?: "dropdown" | "autocomplete" | "button"
}


const getQuantityInput = (schema: JSONSchema): HastElements => {
  return {
      type: "element",
      tagName: "input",
      properties: {
          // type: h()
      },
      children: []
  }
}

const getDurationInput = (schema: JSONSchema): HastElements => {
  return {
      type: "element",
      tagName: "input",
      properties: {
          // type: h()
      },
      children: []
  }
}

interface Choice {
    name?: string;
    id?: string;
    value?: any;
    label?: string

    // For group heading
    enum?: string
}


interface RadioSchema extends Omit<JSONSchema, "enum"> {
    enum: JSONSchema7Type[]
}

function isRadio (schema: JSONSchema): schema is RadioSchema {
    return "enum" in schema;
}

interface CheckboxSchema extends Omit<JSONSchema, "items"> {
    items: JSONSchema7
}

function isCheckbox (schema: JSONSchema): schema is CheckboxSchema {
    return !!schema?.items && schema.items !== true && "enum" in schema.items
}

interface FieldData {
    $id: string;
    title: string;
    description: string;
}

const getField = (data: FieldData, ...rest: any[]): HastElements => (
     h(".form-field",
        h("label", {for: data.$id}, data.title),
        h("span", {id: `${data.$id}-description`}, data.description),
         ...rest
     )
)

const range = (min: number, max: number, step: number = 1): number[] =>
  Array.from({ length: Math.floor((max-min) / step) }, (_, i) => min + i * step)


const getTicks = (ticks: true | (number | null)[], {max, min, step}: {max: number, min: number, step: number}): { value: number | string, label?: number }[] => {
    if (ticks === true) {
        return range(min, max, step).map((step) => ({value: step}));
    } else {
        // @ts-ignore
        return getTicks(true, {max, min, step})
            .map(({value}, i) => ({value, ...(ticks[i] ? {label: ticks[i]} : {})}));
    }
}

const getRangeInput = (schema: JSONSchema): HastElements => {
    let datalist = h("");

    if ("ticks" in schema && schema.ticks) {
        // @ts-ignore
        const ticks = getTicks(schema.ticks, schema);
        datalist = h(`datalist#${schema.$id}-tickmarks`,
            ticks.map(({value, label}) => h("option", {value, label}))
        )
    }

    return (
        getField(schema as FieldData,
            // @ts-ignore
            h("input", {
                type: "range",
                id: schema.$id,
                ariaDescribedby: `${schema.$id}-description`,
                placeholder: schema?.placeholder ?? "",
                min: schema?.min,
                max: schema?.max,
                step: schema?.step,
                list:`${schema.$id}-tickmarks`
            }, schema.default),
            datalist
        )
    )
}


const getListInput = (schema: CheckboxSchema | RadioSchema, items: Choice[], type: "radio" | "checkbox"): HastElements => {
    const isButton = schema.variant === "button";
    const variant = isButton ? ".toggle-button" : "default"
    return (
        getField(schema as FieldData,
            h(`.form-choices.${type}${variant}`, items.map((choice: Choice) => {
                    const id = `${schema.$id}-${choice?.id ?? choice.value}`

                    return h(`.form-choices-item.${type}${variant}`,[
                        h("input", {
                            type,
                            name: schema.$id,
                            id,
                            value: choice.value,
                        }),
                        h("label", {for: id, unselectable: isButton}, choice?.label ?? choice.value)
                    ])
                }
                )
            )
        )
    )
}

const getOptions = (items: Choice[]): HastElements[] => items.map(item => {
        if ("enum" in item) {
            // @ts-ignore
            return h("optgroup", {label: item.label}, getOptions(item.enum));
        }
        // @ts-ignore
        return h("option", {value: item.value}, item.title)
    })


const getDropdownInput = (schema: CheckboxSchema | RadioSchema, items: Choice[], type: "radio" | "checkbox"): HastElements => {
    const options = getOptions(items)
    return (
        getField(schema as FieldData,
            h(`select.form-dropdown`, {
                id: `${schema.$id}-select`,
                name: schema.$id,
                multiple: type === "checkbox",
                size: schema?.minItems
            },
                ...options
            )
        )
    )
}

const getAutocompleteInput = (schema: CheckboxSchema | RadioSchema, items: Choice[]): HastElements => {
    const options = getOptions(items)
    return (
        getField(schema as FieldData,
            h(`.form-autocomplete`,
                h(`input`, {
                    id: `${schema.$id}-autocomplete`,
                    name: schema.$id,
                    type: "autocomplete",
                    list: `${schema.$id}-autocomplete-options`
                }),
                h("datalist", {id: `${schema.$id}-autocomplete-options`},
                    ...options)
            )
        )
    )
}

const getRadioInput = (schema: RadioSchema): HastElements => {
    if (schema.variant === "dropdown") {
        return getDropdownInput(schema, <Choice[]> schema.enum,"radio");
    } else if (schema.variant === "autocomplete") {
        // @ts-ignore
        return getAutocompleteInput(schema, schema.enum);
    }
    return getListInput(schema, <Choice[]> schema.enum,"radio");
}
const getCheckboxInput = (schema: CheckboxSchema): HastElements => {
    if (schema.variant === "dropdown") {
        return getDropdownInput(schema, <Choice[]> schema.items?.enum,"checkbox");
    }
    return getListInput(schema, <Choice[]> schema.items?.enum,"checkbox");
}
const getToggleInput = (schema: JSONSchema): HastElements => (
    getListInput(schema as CheckboxSchema, [{value: true, label: schema?.label}], "checkbox")
)

const getInputWithType = (schema: JSONSchema, type: HTMLInputTypeAttribute): HastElements => (
    getField(schema as FieldData,
        // @ts-ignore
        h("input", {
            type,
            id: schema.$id,
            ariaDescribedby: `${schema.$id}-description`,
            placeholder: schema?.placeholder ?? ""
        }, schema.default)
    )
)

interface TextSchema extends JSONSchema {
    rows?: number
}

const getTextInput = (schema: TextSchema): HastElements => {
    if ("rows" in schema) {
        return getField(schema as FieldData,
            // @ts-ignore
            h("textarea", {
                name: schema.$id,
                ariaDescribedby: `${schema.$id}-description`,
                placeholder: schema?.placeholder ?? "",
                rows: schema.rows
            }, schema.default)
        )
    }
    return getInputWithType(schema, "text")
}

const getInput = (schema: JSONSchema): HastElements => {
    if (isRadio(schema)) {
        return getRadioInput(schema as RadioSchema);
    }

    switch (schema.type) {
        case "quantity":
            return getQuantityInput(schema);
        case "duration":
            return getDurationInput(schema);
        case "datetime":
            return getInputWithType(schema, "datetime-local");
        case "boolean":
            return getToggleInput(schema);
        case "range":
            return getRangeInput(schema);
        case "array":
            if (isCheckbox(schema)) {
                return getCheckboxInput(schema as CheckboxSchema);
            }
    }
    if (schema.type === "tel") {
        schema.placeholder = schema.placeholder || "+# (###) ### ###";
    } else if (schema.type === "email") {
        schema.placeholder = schema.placeholder || "john@example.com";
    } else if (schema.type === "url") {
        schema.placeholder = schema.placeholder || "example.com";
    }

    return getTextInput(schema);
}

export const remarkAsk = () => {
  return (tree: Root) => {
    // @ts-ignore
    visit(tree, { lang: "question" }, (node: Code) => {
        // @ts-ignore
        const questions: JSONSchema[] = yaml.loadAll(node.value);
        const inputs = questions.map(getInput);

        // @ts-ignore
        node.type = "HTML";

        inputs.forEach(({children}) => console.log(children));

        node.data = {
            hName: "div",
            hProperties: {
                className: ["form-row"],
            },
            hChildren: inputs
        }
    });
  };
}
