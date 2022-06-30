import type { Element as HastElements } from 'hast';
import type { JSONSchema } from '../types';
import { getListInput } from './choice';
import type { CheckboxSchema } from './checkbox';

export const getToggleInput = (schema: JSONSchema): HastElements =>
  getListInput(
    schema as CheckboxSchema,
    [{ value: true, label: schema?.label }],
    'checkbox'
  );
