import {JSONSchema} from "../types";
import {Element as HastElements} from "hast";
import {CheckboxSchema} from "./checkbox";
import {getListInput} from "./choice";

export const getToggleInput = (schema: JSONSchema): HastElements => (
    getListInput(schema as CheckboxSchema, [{value: true, label: schema?.label}], "checkbox")
);