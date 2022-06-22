import {getField, getInputWithType} from "../utils";
import {h} from "hastscript";
import type {JSONSchema} from "../types";
import type {Element as HastElements} from "hast";

export interface TextSchema extends JSONSchema {
    rows?: number
}

export const getTextAreaInput = (schema: TextSchema): HastElements =>
    getField(schema,
        // @ts-ignore
        h("textarea", {
            id: schema.$id,
            name: schema.$id,
            ariaDescribedby: `${schema.$id}-description`,
            placeholder: schema?.placeholder ?? "",
            rows: schema.rows
        }, schema.default)
    )

export const getTextInput = (schema: TextSchema): HastElements => {
    if ("rows" in schema) {
        return getTextAreaInput(schema)
    }
    return getInputWithType(schema, "text")
}