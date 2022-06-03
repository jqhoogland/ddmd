import {Element as HastElements} from "hast";
import {h} from "hastscript";
import {HTMLInputTypeAttribute} from "react";
import {JSONSchema} from "./core";
import {ObjectSchema} from "./choice";

export interface FieldData {
    $id: string;
    title?: string;
    description?: string;
}

export const getField = (data: FieldData, ...rest: any[]): HastElements => (
    h(".form-field",
        h("label", {for: data.$id}, data.title),
        h("span", {id: `${data.$id}-description`}, data.description),
        ...rest
    )
)
export const getInputWithType = (schema: JSONSchema, type: HTMLInputTypeAttribute): HastElements => (
    getField(schema,
        // @ts-ignore
        h("input", {
            type,
            id: schema.$id,
            ariaDescribedby: `${schema.$id}-description`,
            placeholder: schema?.placeholder ?? ""
        }, schema.default)
    )
)

/**
 * Does not actually necessarily return a valid instance of `schema`. Returns
 * the falsy version for any leaf values that have no `default` provided.
 * @param schema
 */
export const getDefaultInstance = (schema: JSONSchema): any => {
    if ("default" in schema) {
        return schema.default;
    }

    switch (schema.type) {
        case "string":
            return "";
        case "array":
            return [];
        case "object":
            const obj: Record<string, any> = {};
            return Object.entries((schema as ObjectSchema).properties)
                .forEach(([key, value]) => {
                    obj[key] = getDefaultInstance(value);
                })
    }

    return null
}