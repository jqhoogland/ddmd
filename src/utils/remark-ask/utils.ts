import {Element as HastElements} from "hast";
import {h} from "hastscript";
import {HTMLInputTypeAttribute} from "react";
import {JSONSchema} from "./core";

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