import {Element as HastElements} from "hast";
import {getField, getInputWithType} from "./utils";
import {h} from "hastscript";
import {JSONSchema} from "./core";

interface TextSchema extends JSONSchema {
    rows?: number
}

export const getTextInput = (schema: TextSchema): HastElements => {
    if ("rows" in schema) {
        return getField(schema,
            // @ts-ignore
            h("textarea", {
                id: schema.$id,
                name: schema.$id,
                ariaDescribedby: `${schema.$id}-description`,
                placeholder: schema?.placeholder ?? "",
                rows: schema.rows
            }, schema.default)
        )
    }
    return getInputWithType(schema, "text")
}