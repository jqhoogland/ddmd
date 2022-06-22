import {Choice, getListInput} from "./choice";
import type {Element as HastElements} from "hast";
import type {JSONSchema} from "../types";
import type {JSONSchema7} from "json-schema";

export interface CheckboxItemsSchema extends Omit<JSONSchema7, "enum"> {
    enum: Choice[]
}

export interface CheckboxSchema extends Omit<JSONSchema, "items"> {
    items: CheckboxItemsSchema
}

// @ts-ignore
export function isCheckbox(schema: JSONSchema): schema is CheckboxSchema {
    return schema.type === "array" && !!schema?.items && schema.items !== true && "enum" in schema.items
}

export const getCheckboxInput = (schema: CheckboxSchema): HastElements => {
    return getListInput(schema, <Choice[]>schema.items?.enum, "checkbox");
}