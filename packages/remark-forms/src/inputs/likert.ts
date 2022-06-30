import { h } from 'hastscript';
import type { JSONSchema7 } from 'json-schema';
import type { Element as HastElements } from 'hast';
import { getField } from '../utils';
import type { JSONSchema } from '../types';
import { Choice, enumToChoice } from './choice';

/** Likert */

export interface LikertSchema extends Omit<JSONSchema, 'items'> {
  items: JSONSchema7[];
  // $defs: {
  //     choices: JSONSchema7Definition[]
  // }
}

export function isLikert(schema: JSONSchema): schema is LikertSchema {
  // @ts-expect-error
  return (
    schema?.type === 'array' &&
    Boolean(schema?.items) &&
    Array.isArray(schema.items) &&
    'choices' in schema.$defs
  );
}

interface LikertRow extends Omit<JSONSchema, 'enum'> {
  enum: Choice[];
}

interface LikertData {
  header: Array<string | undefined>;
  rows: LikertRow[];
}

export interface LikertAnswer extends Omit<Choice, 'properties'> {
  $schema: LikertSchema;
}

const getLikertData = (schema: LikertSchema): LikertData => {
  // @ts-expect-error
  const choices = schema.$defs.choices.enum.map(enumToChoice);

  return {
    header: choices.map(({ label }: Choice) => label),
    // @ts-expect-error
    rows: schema.items.map(({ $id, ...rest }: JSONSchema, i: number) => ({
      ...rest,
      $id,
      enum: choices.map((choice: Choice) => ({
        ...choice,
        id: `${schema.$id}-${i}-${choice.value}`,
        name: $id
      }))
    }))
  };
};

export const getLikertInput = (schema: LikertSchema): HastElements => {
  const { header, rows } = getLikertData(schema);

  const renderCol = ({ value, id, name }: Choice): HastElements =>
    h('input', {
      type: 'radio',
      value,
      id,
      name
    });

  return getField(
    schema,
    h(
      'table.likert-table',
      h(
        'thead.likert-head',
        h(
          'tr.likert-row',
          h('th.likert-col-title.likert-top-left'),
          header.map((col) => h('th.likert-col-title', col))
        )
      ),
      h(
        'tbody.likert-body',
        rows.map((row) =>
          h(
            'tr.likert-row',
            h('td.likert-row-title', row.title),
            ...row.enum.map((col) => h('td.likert-col', renderCol(col)))
          )
        )
      )
    )
  );
};
