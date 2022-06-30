import { JSONSchema7 } from 'json-schema';
import { InputType, JSONSchema } from './types';
import {
  getInputType,
  enumToChoice,
  isLikert,
  LikertAnswer,
  LikertSchema,
  ObjectSchema,
  Choice
} from './inputs';
import { RadioSchema } from './inputs/radio';
import { CheckboxSchema } from './inputs/checkbox';

interface Value<T> {
  string: T;
  [key: string]: any;
}

interface BaseUpdateOptions {
  id: string;
  name: string;
  value: any;
  checked?: boolean;
}

interface UpdateValueOptions extends BaseUpdateOptions {
  schema: JSONSchema;
  type: InputType;
}

const optionEquals = (opt: any, name: string): boolean =>
  (opt?.value ?? '').toString() === name;

const getCheckboxValue = (
  previousValue: Value<Choice[]>,
  {
    checked,
    schema,
    name
  }: { checked: boolean; schema: CheckboxSchema; name: string }
): Choice[] => {
  if (!checked) {
    return previousValue.value.filter((opt: any) => !optionEquals(opt, name));
  }

  return [
    ...(previousValue?.value ?? []),
    ...schema.items.enum.filter((opt: any) => optionEquals(opt, name))
  ];
};

function getValue(
  previousValue: Value<any>,
  { id, name, value, checked = false, type, schema }: UpdateValueOptions
): any {
  switch (type) {
    case 'radio':
      return (schema as RadioSchema).enum.find((opt: Choice) =>
        optionEquals(opt, name)
      );
    case 'checkbox':
      return getCheckboxValue(previousValue, {
        name,
        checked,
        schema: schema as CheckboxSchema
      });
    case 'number':
      return { value: Number.parseFloat(value) };
    case 'quantity':
      return { value: Number.parseFloat(value), units: schema.units };
    case 'currency':
      return { value: Number.parseFloat(value), units: schema.units };
  }

  return { value };
}

interface UpdateLikertOptions extends BaseUpdateOptions {
  questionIdx: number;
  answerValue: string;
  schema: LikertSchema;
}

const updateLikert = (
  object: Record<string, any>,
  { id, questionIdx, answerValue, schema, name }: UpdateLikertOptions
): Record<string, any> => {
  const defaultAnswers = schema.items.map((schema: JSONSchema7) => ({
    $schema: schema,
    value: null
  }));
  const previousAnswers = object[id] ?? defaultAnswers;

  const choice = enumToChoice(
    // @ts-expect-error
    schema.$defs.choices.enum.find(
      (item: { const: any }) => item.const.toString() === answerValue
    )
  );
  const answer: LikertAnswer = { ...previousAnswers[questionIdx], ...choice };
  const answers = previousAnswers.map((previous: LikertAnswer) =>
    previous.$schema.$id === answer.$schema.$id ? answer : previous
  );

  answers.$schema = schema;

  return {
    ...object,
    [id]: answers,
    [name]: answer
  };
};

const updateList = (
  object: Record<string, any>,
  { id, questionIdx, answerValue, schema, name }: UpdateLikertOptions
): Record<string, any> => ({ ...object, [name]: answerValue });

interface UpdateOptions extends BaseUpdateOptions {
  schema: ObjectSchema;
}

const updateNested = (
  object: Record<string, any>,
  { id, schema, ...options }: UpdateOptions
): Record<string, any> => {
  const [rootID, ...rest] = id.split('-');
  const fieldSchema = schema.properties?.[rootID];

  if (fieldSchema) {
    if (isLikert(fieldSchema)) {
      return updateLikert(object, {
        questionIdx: Number.parseInt(rest[0]),
        answerValue: rest[1],
        id: rootID,
        schema: fieldSchema,
        ...options
      });
    }

    return updateList(object, {
      questionIdx: Number.parseInt(rest[0]),
      answerValue: rest[1],
      id: rootID,
      schema: fieldSchema as LikertSchema,
      ...options
    });
  }

  throw `Couldn't find ${rootID} in schema with properties ${Object.keys(
    schema.properties
  )}`;
};

const updateFlat = (
  object: Record<string, any>,
  { id, schema, name, ...options }: UpdateOptions
): Record<string, any> => {
  const fieldSchema = schema.properties?.[id];
  if (fieldSchema) {
    const type = getInputType(fieldSchema);

    return {
      ...object,
      [name]: getValue(object[name], {
        name,
        type,
        schema: fieldSchema,
        id,
        ...options
      })
    };
  }

  throw `Couldn't find ${id} in schema with properties ${Object.keys(
    schema.properties
  )}`;
};

export const update = (
  object: Record<string, any> = {},
  options: UpdateOptions
): Record<string, any> =>
  options.id.includes('-')
    ? updateNested(object, options)
    : updateFlat(object, options);
