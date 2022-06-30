import type { Element as HastElements } from 'hast';
import type { JSONSchema } from '../types';
import { Choice, getListInput } from './choice';

export interface RadioSchema extends Omit<JSONSchema, 'enum'> {
  enum: Choice[];
}

// @ts-expect-error
export function isRadio(schema: JSONSchema): schema is RadioSchema {
  return 'enum' in schema;
}

export const getRadioInput = (schema: RadioSchema): HastElements =>
  getListInput(schema, schema.enum, 'radio');
