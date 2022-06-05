import {InputType, JSONSchema} from "../dist/types";
import {enumToChoice, isLikert, LikertAnswer, LikertSchema, ObjectSchema} from "../dist/choice";
import {getInputType} from "../dist";

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

function getValue(prevValue: Value<any>, {id, name, value, checked, type, schema}: UpdateValueOptions): any {

    const optionEquals = (opt: any): boolean => (opt?.value ?? "").toString() === name;

    switch (type) {
        case "radio":
            // @ts-ignore
            return schema.enum.find(optionEquals);
        case "checkbox":
            if (!checked) {
                return prevValue.value.filter((opt: any) => !optionEquals(opt));
            }
            // @ts-ignore
            return [
              ...(prevValue?.value ?? []),
              // @ts-ignore
              ...schema.items.enum.filter((opt: any) => optionEquals(opt))
            ];
        case "number":
            return {value: parseFloat(value)};
        case "quantity":
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

    throw "Oops!"
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
    throw "Oops! Flat."
}


export const update = (obj: Record<string, any> = {}, options: UpdateOptions): Record<string, any> => {
    if (options.id.includes("-")) {
        return updateNested(obj, options)
    }

    return updateFlat(obj, options);
}
