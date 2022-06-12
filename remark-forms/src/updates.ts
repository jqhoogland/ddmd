import {InputType, JSONSchema} from "./types";
import {getInputType, enumToChoice, isLikert, LikertAnswer, LikertSchema, ObjectSchema, Choice} from "./inputs";
import {JSONSchema7} from "json-schema";
import {RadioSchema} from "./inputs/radio";
import {CheckboxSchema} from "./inputs/checkbox";

type Value<T> = {
    string: T
    [key: string]: any
};

interface BaseUpdateOptions {
    id: string;
    name: string;
    value: any;
    checked?: boolean;
}

interface UpdateValueOptions extends BaseUpdateOptions {
    schema: JSONSchema,
    type: InputType
}

const optionEquals = (opt: any, name: string): boolean => (opt?.value ?? "").toString() === name;

const getCheckboxValue = (prevValue: Value<Choice[]>, {checked, schema, name}: {checked: boolean, schema: CheckboxSchema, name: string}): Choice[] => {
    if (!checked) {
        return prevValue.value.filter((opt: any) => !optionEquals(opt, name));
    }
    return [
      ...(prevValue?.value ?? []),
      ...(schema as CheckboxSchema).items.enum.filter((opt: any) => optionEquals(opt, name))
    ];
}


function getValue(prevValue: Value<any>, {id, name, value, checked, type, schema}: UpdateValueOptions): any {

    switch (type) {
        case "radio":
            return (schema as RadioSchema).enum.find((opt: Choice) => optionEquals(opt, name));
        case "checkbox":
            return getCheckboxValue(prevValue, {name, checked, schema: schema as CheckboxSchema});
        case "number":
            return {value: parseFloat(value)};
        case "quantity":
            return {value: parseFloat(value), units: schema.units};
        case "currency":
            return {value: parseFloat(value), units: schema.units};
    }
    return {value};
}


interface UpdateLikertOptions extends BaseUpdateOptions {
    questionIdx: number;
    answerValue: string;
    schema: LikertSchema;
}

const updateLikert = (obj: Record<string, any>, {id, questionIdx, answerValue, schema, name}: UpdateLikertOptions): Record<string, any> => {
    const defaultAnswers = schema.items.map(
            (schema: JSONSchema7) => ({$schema: schema, value: null}));
    const prevAnswers = obj[id] ?? defaultAnswers;

    const choice = enumToChoice(
        // @ts-ignore
        schema.$defs.choices.enum
            .find((item: { const: any }) => item.const.toString() === answerValue)
    );
    const answer: LikertAnswer = {...prevAnswers[questionIdx], ...choice};
    const answers = prevAnswers.map((prev: LikertAnswer) => (prev.$schema.$id === answer.$schema.$id ? answer : prev));

    answers.$schema = schema;

    return {
        ...obj,
        [id]: answers,
        [name]: answer
    }
}

interface UpdateOptions extends BaseUpdateOptions {
    schema: ObjectSchema;
}

const updateNested = (obj: Record<string, any>, {id, schema, ...options}: UpdateOptions): Record<string, any> => {
    const [rootID, ...rest] = id.split("-");
    const fieldSchema = schema.properties?.[rootID];

    if (fieldSchema && isLikert(fieldSchema)) {
        return updateLikert(obj, {
            questionIdx: parseInt(rest[0]),
            answerValue: rest[1],
            id: rootID,
            schema: fieldSchema as LikertSchema,
            ...options
        })
    }

    throw `Couldn't find ${rootID} in schema with properties ${Object.keys(schema.properties)}`
}

const updateFlat = (obj: Record<string, any>, {id, schema, name, ...options}: UpdateOptions): Record<string, any> => {
    const fieldSchema = schema.properties?.[id];

    if (fieldSchema) {
        const type = getInputType(fieldSchema);

        return {
            ...obj,
            [name]: getValue(obj[name], {name, type, schema: fieldSchema, id, ...options})
        }
    }
    throw `Couldn't find ${id} in schema with properties ${Object.keys(schema.properties)}`
}


export const update = (obj: Record<string, any> = {}, options: UpdateOptions): Record<string, any> =>
    (options.id.includes("-")) ? updateNested(obj, options) : updateFlat(obj, options)

