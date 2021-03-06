import { h } from 'hastscript';
import type { Element as HastElements } from 'hast';
import { getField } from '../utils';
import { getOptions } from './choice';
import type { RadioSchema } from './radio';

export const getAutocompleteInput = (schema: RadioSchema): HastElements => {
  const options = getOptions(schema.enum);

  return getField(
    schema,
    h(
      '.form-autocomplete',
      h('input', {
        id: `${schema.$id}-autocomplete`,
        name: schema.$id,
        type: 'autocomplete',
        list: `${schema.$id}-autocomplete-options`
      }),
      h('datalist', { id: `${schema.$id}-autocomplete-options` }, ...options)
    )
  );
};
