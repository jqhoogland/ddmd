import {Choice, getListInput} from "./choice";
import type {JSONSchema} from "../types";
import type {Element as HastElements} from "hast";


export interface RadioSchema extends Omit<JSONSchema, "enum"> {
    enum: Choice[]
}

// @ts-ignore
export function isRadio(schema: JSONSchema): schema is RadioSchema {
    return "enum" in schema;
}

export const getRadioInput = (schema: RadioSchema): HastElements =>
    getListInput(schema, <Choice[]>schema.enum, "radio")
