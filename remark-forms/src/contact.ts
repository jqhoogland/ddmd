import {Element as HastElements} from "hast";
import {getInputWithType} from "./utils";
import {JSONSchema} from "./types";

export const getTelInput = (schema: JSONSchema): HastElements => {
    schema.placeholder = schema.placeholder || "+# (###) ### ###";
    return getInputWithType(schema, "tel");
}
export const getEmailInput = (schema: JSONSchema): HastElements => {
    schema.placeholder = schema.placeholder || "john@example.com";
    return getInputWithType(schema, "email");
}
export const getURLInput = (schema: JSONSchema): HastElements => {
    schema.placeholder = schema.placeholder || "example.com";
    return getInputWithType(schema, "url")
}