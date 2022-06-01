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

type CustomJSONSchemaTypeName = "quantity" | "range" | "datetime" | "date" | "time" | "duration" | "email" | "file" |
    "url" | "tel";

type JSONSchemaTypeName = JSONSchema7TypeName | CustomJSONSchemaTypeName;

interface JSONSchema extends Omit<JSONSchema7, "type"> {
    type: JSONSchemaTypeName,
    placeholder?: string
    label?: string  // Only for boolean toggles
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

const getRangeInput = (schema: JSONSchema): HastElements => {
  return {
      type: "element",
      tagName: "input",
      properties: {
          // type: h()
      },
      children: []
  }
}

const getDateInput = (schema: JSONSchema): HastElements => {
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

const getListInput = (schema: CheckboxSchema | RadioSchema, items: Choice[], type: "radio" | "checkbox"): HastElements => (
    h(".form-field",
        h("label", {for: schema.$id}, schema.title),
        h("span", {id: `${schema.$id}-description`}, schema.description),
        h(`div.form-${type}`, items.map((choice: Choice) => {
            const id = `${schema.$id}-${choice?.id ?? choice.value}`

            return h(`div.form-${type}-item`,[
                    h("input", {
                        type,
                        name: schema.$id,
                        id,
                        value: choice.value,
                    }),
                    h("label", {for: id}, choice?.label ?? choice.value)
                ])
            }
          )
        )
    )
)

const getRadioInput = (schema: RadioSchema): HastElements => getListInput(schema, <Choice[]> schema.enum,"radio");
const getCheckboxInput = (schema: CheckboxSchema): HastElements => getListInput(schema, <Choice[]> schema.items?.enum,"checkbox");
const getToggleInput = (schema: JSONSchema): HastElements => (
    h("div.form-field",
        h("label", {for: schema.$id}, schema.title),
        h("span", {id: `${schema.$id}-description`}, schema.description),
        h("div.form-checkbox",
            h("input", {type: "checkbox", name: schema.$id, id: schema.$id, value: true}),
            h("label", {for: schema.$id}, schema?.label)
        )
    )
)

const getInputWithType = (schema: JSONSchema, type: HTMLInputTypeAttribute): HastElements => (
    h("div.form-field",
        h("label", {"for": schema.$id}, schema.title),
        h("span", {"id": `${schema.$id}-description`}, schema.description),
        // @ts-ignore
        h("input", {
            type,
            id: schema.$id,
            ariaDescribedby: `${schema.$id}-description`,
            placeholder: schema?.placeholder ?? ""
        }, schema.default)
    )
)

const getInput = (schema: JSONSchema): HastElements => {
    if (isRadio(schema)) {
        return getRadioInput(schema as RadioSchema);
    }

    switch (schema.type) {
        case "string":
            return getInputWithType(schema, "text")
        case "quantity":
            return getQuantityInput(schema)
        case "datetime":
            return getInputWithType(schema, "datetime-local")
        case "duration":
            return getDurationInput(schema)
        case "boolean":
            return getToggleInput(schema)
        case "array":
            if (isCheckbox(schema)) {
                return getCheckboxInput(schema as CheckboxSchema)
            }
    }
    if (schema.type === "tel") {
        schema.placeholder = schema.placeholder || "+# (###) ### ###"
    } else if (schema.type === "email") {
        schema.placeholder = schema.placeholder || "john@example.com"
    } else if (schema.type === "url") {
        schema.placeholder = schema.placeholder || "example.com"
    }

    return getInputWithType(schema, schema.type)
}

export const remarkAsk = () => {
  return (tree: Root) => {
    // @ts-ignore
    visit(tree, { lang: "question" }, (node: Code) => {
        // @ts-ignore
        const questions: JSONSchema[] = yaml.loadAll(node.value);
        const inputs = questions.map(getInput)

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
