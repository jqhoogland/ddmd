import {getField} from "../utils";
import {h} from "hastscript";
import {Choice, getOptions} from "./choice";
import type {Element as HastElements} from "hast";
import type {JSONSchema} from "../types";

export const getSelectInput = (schema: JSONSchema, items: Choice[]): HastElements => {
    const options = getOptions(items);

    return (
        getField(schema,
            h(`select.form-dropdown`, {
                    id: `${schema.$id}-select`,
                    name: schema.$id,
                    multiple: ("items" in schema),
                    size: schema?.minItems
                },
                ...options
            )
        )
    )
}