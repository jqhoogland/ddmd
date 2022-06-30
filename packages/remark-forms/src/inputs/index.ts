import type { Element as HastElements } from 'hast';
import { getInputWithType } from '../utils';
import type { InputType, JSONSchema } from '../types';
import { getRadioInput, isRadio, RadioSchema } from './radio';
import { getSelectInput } from './select';
import { getAutocompleteInput } from './autocomplete';
import { getCurrencyInput, getQuantityInput } from './quantity';
import { getToggleInput } from './toggle';
import { getRangeInput } from './slider';
import { getLikertInput, isLikert, LikertSchema } from './likert';
import { getTextInput, TextSchema } from './text';
import { CheckboxSchema, getCheckboxInput, isCheckbox } from './checkbox';

export * from './likert';
export * from './choice';

/**
 * Note on "type":
 * JSON Schemas have a `type` property that corresponds to a basic JSON type
 * or one of our custom types.
 * Think primitives like "number", "boolean", "object", "array".
 *
 * This is *not* the same as the `type` attribute on an `<input/>` element.
 * This function maps the former to the latter. (Actually, we've broadened the
 * return type to also include non-`<input/>` inputs like `"textarea"` and
 * `"select"`.
 */
export const getInputType = (schema: JSONSchema): InputType => {
  if (isRadio(schema)) {
    if (schema.display?.variant === 'dropdown') {
      return 'select:one';
    }

    if (schema.display?.variant === 'autocomplete') {
      return 'autocomplete';
    }

    return 'radio';
  }

  if (isCheckbox(schema)) {
    if (schema.display?.variant === 'dropdown') {
      return 'select:multiple';
    }

    return 'checkbox';
  }

  if (isLikert(schema)) {
    return 'likert';
  }

  if (schema.type === 'string') {
    if (schema.format === 'datetime') {
      return 'datetime-local';
    }

    if (schema.format === 'tel') {
      return 'tel';
    }

    if (schema.format === 'uri') {
      return 'url';
    }

    if (schema.format === 'color') {
      return 'color';
    }

    return 'text';
  }

  if (schema.type === 'boolean') {
    return 'toggle';
  }

  if (
    schema.type === 'array' ||
    schema.type === 'object' ||
    schema.type === 'null'
  ) {
    throw `Cannot convert schema of type ${schema.type} to a valid input type.`;
  } else if (schema.type === 'integer') {
    return 'number';
  }

  return schema?.type;
};

/**
 * This returns a hast representation of the input for a given schema.
 *
 * TODO: We should enable a "plugin" approach where users can define
 *       their own custom schema types & inputs, and extend these
 *       defaults as they choose. It would also be much more elegant than this
 *       gross spaghetti tightly coupled crap.
 */
export const getInput = (schema: JSONSchema): HastElements => {
  const type = getInputType(schema);

  switch (type) {
    case 'radio':
      return getRadioInput(schema as RadioSchema);
    case 'checkbox':
      return getCheckboxInput(schema as CheckboxSchema);
    case 'select:one':
      return getSelectInput(schema, (schema as RadioSchema).enum);
    case 'select:multiple':
      return getSelectInput(schema, (schema as CheckboxSchema).items.enum);
    case 'autocomplete':
      return getAutocompleteInput(schema as RadioSchema);
    case 'quantity':
      return getQuantityInput(schema);
    case 'currency':
      return getCurrencyInput(schema);
    case 'toggle':
      return getToggleInput(schema);
    case 'range':
      return getRangeInput(schema);
    case 'likert':
      return getLikertInput(schema as LikertSchema);
    case 'text':
    case undefined:
      return getTextInput(schema as TextSchema);
  }

  return getInputWithType(schema, type);
};
