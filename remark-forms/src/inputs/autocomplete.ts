import {CheckboxSchema} from "./checkbox";
import {RadioSchema} from "./radio";
import {Element as HastElements} from "hast";
import {getField} from "../utils";
import {h} from "hastscript";
import {Choice, getOptions} from "./choice";
import {JSONSchema} from "../types";

export const getAutocompleteInput = (schema: RadioSchema): HastElements => {
    const options = getOptions(schema.enum);

    return (
        getField(schema,
            h(`.form-autocomplete`,
                h(`input`, {
                    id: `${schema.$id}-autocomplete`,
                    name: schema.$id,
                    type: "autocomplete",
                    list: `${schema.$id}-autocomplete-options`
                }),
                h("datalist", {id: `${schema.$id}-autocomplete-options`},
                    ...options)
            )
        )
    )
}