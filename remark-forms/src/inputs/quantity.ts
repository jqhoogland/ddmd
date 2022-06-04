import {JSONSchema} from "../types";
import {Element as HastElements} from "hast";
import {getField} from "../utils";
import {h} from "hastscript";


/**
 * A number input that displays `schema.units` after the number.
 */
export const getQuantityInput = (schema: JSONSchema): HastElements => {
    const units = schema.units ?? ""

    return (
        getField(schema,
            h(".quantity",
                h(`.units.suffix`, units),
                // @ts-ignore
                h(`input.suffixed`, {
                    type: "number",
                    id: schema.$id,
                    ariaDescribedby: `${schema.$id}-description`,
                    placeholder: schema?.placeholder ?? "",
                }, schema.default)
            )
        )
    );
}


/**
 * A number input that displays `schema.units` in front of the number.
 * TODO: Better naming for prefix/suffix unit quantities.
 */
export const getCurrencyInput = (schema: JSONSchema): HastElements => {
    const units = schema.units ?? ""
    return (
        getField(schema,
            h(".quantity", // TODO: .currency
                h(`.units.prefix`, units),
                // @ts-ignore
                h(`input.prefixed`, {
                    type: "number",
                    id: schema.$id,
                    ariaDescribedby: `${schema.$id}-description`,
                    placeholder: schema?.placeholder ?? "",
                }, schema.default)
            )
        )
    );
}