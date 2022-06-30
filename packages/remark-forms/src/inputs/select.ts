import { h } from 'hastscript';
import type { Element as HastElements } from 'hast';
import { getField } from '../utils';
import type { JSONSchema } from '../types';
import { Choice, getOptions } from './choice';

export const getSelectInput = (
  schema: JSONSchema,
  items: Choice[]
): HastElements => {
  const options = getOptions(items);

  return getField(
    schema,
    h(
      'select.form-dropdown',
      {
        id: `${schema.$id}-select`,
        name: schema.$id,
        multiple: 'items' in schema,
        size: schema?.minItems
      },
      ...options
    )
  );
};
