import {JSONSchema7, JSONSchema7TypeName} from "json-schema";

export type CustomJSONSchemaTypeName = "quantity" | "currency" | "submit";
export type JSONSchemaTypeName = JSONSchema7TypeName | CustomJSONSchemaTypeName;

interface RemarkFormsDisplay {
    // type = "boolean"
    label?: string

    // type = "range" | "number"
    min?: number
    max?: number
    step?: number
    ticks?: boolean | number | (number | null)[]  // TODO: Use enum instead

    // Radios & Checkboxes
    variant?: "dropdown" | "autocomplete" | "button"

    // type = "quantity"
    units?: string

}

export interface JSONSchema extends Omit<JSONSchema7, "type" | "$id"> {
    $id: string,
    type: JSONSchemaTypeName,
    placeholder?: string

    // type = "boolean"
    label?: string

    // type = "range" | "number"
    min?: number
    max?: number
    step?: number
    ticks?: boolean | number | (number | null)[]  // TODO: Use enum instead

    // Radios & Checkboxes
    variant?: "dropdown" | "autocomplete" | "button"

    // type = "quantity"
    units?: string

    display: RemarkFormsDisplay
}

export type JSONSchemaStringFormat = "datetime" | "date" | "time";
export type CustomJSONSchemaStringFormat = "week" | "month";
export type StringFormat = JSONSchemaStringFormat | CustomJSONSchemaStringFormat;

export type BaseInputType =
    "text"
    | "datetime-local"
    | "date"
    | "time"
    | "week"
    | "month"
    | "number"
    | "range"
    | "search"
    | "file"
    | "radio"
    | "checkbox"
    | "password"
    | "submit"
    | "tel"
    | "email"
    | "url"
    | "color"
    | "autocomplete";

export type ExtraInputType = "textarea" | "select:one" | "select:multiple";
export type CustomInputType = "likert" | "toggle" | "quantity" | "currency";

export type InputType = BaseInputType | ExtraInputType | CustomInputType | null | undefined;