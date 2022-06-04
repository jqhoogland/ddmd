import { JSONSchema7, JSONSchema7TypeName } from "json-schema";

export type CustomJSONSchemaTypeName = "quantity" | "range" | "datetime" | "date" | "time" | "email" | "file" |
    "url" | "tel";
export type JSONSchemaTypeName = JSONSchema7TypeName | CustomJSONSchemaTypeName;

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
}

export type InputType = Omit<JSONSchemaTypeName, "datetime" | "string"> | "datetime-local" | "text" | "radio" |
    "checkbox" | "likert" | undefined;