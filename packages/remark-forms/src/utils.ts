import { h } from 'hastscript';
import type { Element as HastElements } from 'hast';
import type { ObjectSchema } from './inputs/choice';
import type { InputType, JSONSchema } from './types';

export interface FieldData {
  $id: string;
  title?: string;
  description?: string;
}

export const getField = (data: FieldData, ...rest: any[]): HastElements =>
  h(
    '.form-field',
    h('label', { for: data.$id }, data.title),
    h('span', { id: `${data.$id}-description` }, data.description),
    ...rest
  );
export const getInputWithType = (
  schema: JSONSchema,
  type: InputType
): HastElements =>
  getField(
    schema,
    // @ts-expect-error
    h(
      'input',
      {
        type,
        id: schema.$id,
        name: schema.$id,
        ariaDescribedby: `${schema.$id}-description`,
        placeholder: schema?.placeholder ?? ''
      },
      schema.default
    )
  );

/**
 * Does not actually necessarily return a valid instance of `schema`. Returns
 * the falsy version for any leaf values that have no `default` provided.
 * @param schema
 */
export const getDefaultInstance = (schema: JSONSchema): any => {
  if ('default' in schema) {
    return schema.default;
  }

  switch (schema.type) {
    case 'string':
      return '';
    case 'array':
      return [];
    case 'object':
      const object: Record<string, any> = {};
      {
        for (const [key, value] of Object.entries(
          (schema as ObjectSchema).properties
        )) {
          object[key] = getDefaultInstance(value);
        }

        return;
      }
  }

  return null;
};
