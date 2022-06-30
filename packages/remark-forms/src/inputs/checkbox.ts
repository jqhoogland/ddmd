import type { Element as HastElements } from 'hast';
import type { JSONSchema7 } from 'json-schema';
import type { JSONSchema } from '../types';
import { Choice, getListInput } from './choice';

export interface CheckboxItemsSchema extends Omit<JSONSchema7, 'enum'> {
  enum: Choice[];
}

export interface CheckboxSchema extends Omit<JSONSchema, 'items'> {
  items: CheckboxItemsSchema;
}

// @ts-expect-error
export function isCheckbox(schema: JSONSchema): schema is CheckboxSchema {
  return (
    schema.type === 'array' &&
    Boolean(schema?.items) &&
    schema.items !== true &&
    'enum' in schema.items
  );
}

export const getCheckboxInput = (schema: CheckboxSchema): HastElements =>
  getListInput(schema, schema.items?.enum, 'checkbox');
