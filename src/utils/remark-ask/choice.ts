import {Element as HastElements} from "hast";
import {h} from "hastscript";
import {getField} from "./utils";
import {JSONSchema7, JSONSchema7Type} from "json-schema";
import {JSONSchema} from "./core";

export interface ObjectSchema extends Omit<JSONSchema, "type" | "properties"> {
    type: "object",
    properties: {
        [key: string]: JSONSchema;
    };
}

interface Choice {
    name?: string;
    id?: string;
    value?: any;
    label?: string;
    description?: string;
}

interface ChoiceGroup extends Choice {
    enum: string
}

/** Radios */

export interface RadioSchema extends Omit<JSONSchema, "enum"> {
    enum: JSONSchema7Type[]
}

export function isRadio(schema: JSONSchema): schema is RadioSchema {
    return "enum" in schema;
}

/** Checkboxes */

export interface CheckboxSchema extends Omit<JSONSchema, "items"> {
    items: JSONSchema7
}

export function isCheckbox(schema: JSONSchema): schema is CheckboxSchema {
    return schema.type === "array" && !!schema?.items && schema.items !== true && "enum" in schema.items
}

/** Likert */

export interface LikertSchema extends Omit<JSONSchema, "items"> {
    items: JSONSchema7[],
    // $defs: {
    //     choices: JSONSchema7Definition[]
    // }
}

export function isLikert(schema: JSONSchema): schema is LikertSchema {
    // @ts-ignore
    return schema?.type === "array" && !!schema?.items && Array.isArray(schema.items) && "choices" in schema.$defs
}

const getListInput = (schema: CheckboxSchema | RadioSchema, items: Choice[], type: "radio" | "checkbox"): HastElements => {
    const isButton = schema.variant === "button";
    const variant = isButton ? ".toggle-button" : "default"
    return (
        getField(schema,
            h(`.form-choices.${type}${variant}`, items.map((choice: Choice) => {
                    const id = `${schema.$id}-${choice?.id ?? choice.value}`

                    return h(`.form-choices-item.${type}${variant}`, [
                        h("input", {
                            type,
                            name: schema.$id,
                            id,
                            value: choice.value,
                        }),
                        h("label", {for: id, unselectable: isButton}, choice?.label ?? choice.value)
                    ])
                })
            )
        )
    )
}


const getOptions = (items: (Choice | ChoiceGroup)[]): HastElements[] => items.map(item => {
    if ("enum" in item) {
        // @ts-ignore
        return h("optgroup", {label: item.label}, getOptions(item.enum));
    }
    // @ts-ignore
    return h("option", {value: item.value}, item.title)
})

const getDropdownInput = (schema: CheckboxSchema | RadioSchema, items: Choice[], type: "radio" | "checkbox"): HastElements => {
    const options = getOptions(items);

    return (
        getField(schema,
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
    const options = getOptions(items);

    return (
        getField(schema,
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
export const getRadioInput = (schema: RadioSchema): HastElements => {
    if (schema.variant === "dropdown") {
        return getDropdownInput(schema, <Choice[]>schema.enum, "radio");
    } else if (schema.variant === "autocomplete") {
        // @ts-ignore
        return getAutocompleteInput(schema, schema.enum);
    }
    return getListInput(schema, <Choice[]>schema.enum, "radio");
}
export const getCheckboxInput = (schema: CheckboxSchema): HastElements => {
    if (schema.variant === "dropdown") {
        return getDropdownInput(schema, <Choice[]>schema.items?.enum, "checkbox");
    }
    return getListInput(schema, <Choice[]>schema.items?.enum, "checkbox");
}
export const getToggleInput = (schema: JSONSchema): HastElements => (
    getListInput(schema as CheckboxSchema, [{value: true, label: schema?.label}], "checkbox")
)

interface LikertRow extends Omit<JSONSchema, "enum"> {
    enum: Choice[]
};

interface LikertData {
    header: (string | undefined)[];
    rows: LikertRow[];
}

export interface LikertAnswer extends Omit<JSONSchema, "properties">{
    properties: Choice[]
}

export const enumToChoice = ({const: const_, title, description}: JSONSchema7): Choice => ({
    value: const_,
    label: title,
    description,
});

const getLikertData = (schema: LikertSchema): LikertData => {
    // @ts-ignore
    const choices = schema.$defs.choices.enum.map(enumToChoice);

    return {
        header: choices.map(({label}: Choice) => label),
        // @ts-ignore
        rows: schema.items.map(({ $id, ...rest}: JSONSchema, i: number) => ({
            ...rest,
            $id,
            enum: choices.map((choice: Choice) => ({
                ...choice,
                id: `${schema.$id}-${i}-${choice.value}`,
                name: $id
            }))
        }))
    }
}
export const getLikertInput = (schema: LikertSchema): HastElements => {
    const {header, rows} = getLikertData(schema);

    const renderCol = ({value, id, name}: Choice): HastElements => h("input",
        {
            type: "radio",
            value,
            id,
            name,
        },
    )

    return getField(
        schema,
        h("table.likert-table",
            h("thead.likert-head",
                h("tr.likert-row",
                    h("th.likert-col-title.likert-top-left"),
                    header.map(col => h("th.likert-col-title", col))
                )
            ),
            h("tbody.likert-body",
                rows.map(row =>
                    h("tr.likert-row",
                        h("td.likert-row-title", row.title),
                        ...row.enum.map((col) => h("td.likert-col", renderCol(col)))
                    )
                )
            )
        )
    )
}