import {Element as HastElements} from "hast";
import {h} from "hastscript";
import {getField} from "../utils";
import {JSONSchema7} from "json-schema";
import {JSONSchema} from "../types";
import {RadioSchema} from "./radio";
import {CheckboxSchema} from "./checkbox";

export interface ObjectSchema extends Omit<JSONSchema, "type" | "properties"> {
    type: "object",
    properties: {
        [key: string]: JSONSchema;
    };
}

export interface Choice {
    name?: string;
    id?: string;
    value?: any;
    label?: string;
    description?: string;
}

interface ChoiceGroup extends Choice {
    enum: string
}

/**
 * Render a list of checkbox or radio items.
 */
export const getListInput = (schema: CheckboxSchema | RadioSchema, items: Choice[], type: "radio" | "checkbox"): HastElements => {
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


export const getOptions = (items: (Choice | ChoiceGroup)[]): HastElements[] => items.map(item => {
    if ("enum" in item) {
        // @ts-ignore
        return h("optgroup", {label: item.label}, getOptions(item.enum));
    }
    // @ts-ignore
    return h("option", {value: item.value}, item.title)
})

export const enumToChoice = ({const: const_, title, description}: JSONSchema7): Choice => ({
    value: const_,
    label: title,
    description,
});

