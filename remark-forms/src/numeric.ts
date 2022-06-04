import {Element as HastElements} from "hast";
import {CURRENCIES} from "./constants";
import {h} from "hastscript";
import {JSONSchema} from "./types";
import {getField} from "./utils";

export const getQuantityInput = (schema: JSONSchema): HastElements => {
    const units = schema.units ?? ""
    const position = Object.values(CURRENCIES)
        .indexOf(units) >= 0
        ? "prefix" : "suffix";

    return (
        getField(schema,
            h(".quantity",
                h(`.units.${position}`, units),
                // @ts-ignore
                h(`input.${position}ed`, {
                    type: "number",
                    id: schema.$id,
                    ariaDescribedby: `${schema.$id}-description`,
                    placeholder: schema?.placeholder ?? "",
                }, schema.default)
            )
        )
    );
}

const range = (min: number, max: number, step: number = 1): number[] =>
    Array.from({length: Math.floor((max - min) / step)}, (_, i) => min + i * step)

const getTicks = (ticks: true | (number | null)[], {
    max,
    min,
    step
}: { max: number, min: number, step: number }): { value: number | string, label?: number }[] => {
    if (ticks === true) {
        return range(min, max, step).map((step) => ({value: step}));
    } else {
        // @ts-ignore
        return getTicks(true, {max, min, step})
            .map(({value}, i) => ({value, ...(ticks[i] ? {label: ticks[i]} : {})}));
    }
}
export const getRangeInput = (schema: JSONSchema): HastElements => {
    let datalist = h("");

    if ("ticks" in schema && schema.ticks) {
        // @ts-ignore
        const ticks = getTicks(schema.ticks, schema);
        datalist = h(`datalist#${schema.$id}-tickmarks`,
            ticks.map(({value, label}) => h("option", {value, label}))
        )
    }

    return (
        getField(schema,
            // @ts-ignore
            h("input", {
                type: "range",
                id: schema.$id,
                ariaDescribedby: `${schema.$id}-description`,
                placeholder: schema?.placeholder ?? "",
                min: schema?.min,
                max: schema?.max,
                step: schema?.step,
                list: `${schema.$id}-tickmarks`
            }, schema.default),
            datalist
        )
    )
}