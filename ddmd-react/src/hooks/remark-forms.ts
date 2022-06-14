import { useEvent } from 'react-use';
import { ObjectSchema } from "remark-forms/dist/choice";
import React, { ChangeEvent, LegacyRef, MutableRefObject, Ref } from "react";
import processSchema from "../processSchema";
import { getDefaultInstance } from "remark-forms/dist/utils";
import { JSONSchema } from "remark-forms/dist/types";
import { update } from "remark-forms";


const EMPTY_SCHEMA: ObjectSchema = {
  $id: "empty",
  type: "object",
  properties: {}
}

/**
 * Given a string representing a Remark-Forms document, returns the JSON schema
 * for the form as a whole (where `$id`s become the keys of the form).
 */
function useSchema(body: string): ObjectSchema {
  const [schema, setSchema] = React.useState<ObjectSchema>(EMPTY_SCHEMA);

  React.useEffect(() => {
    processSchema(body, {}).then(setSchema);
  }, [body]);

  return schema;
}


/**
 * Given a `ref` to a `<form/>` element and a json `schema` that describes the
 * contents of that form, return the active instance of the `schema`
 * contained in the form.
 */
function useFormState(
  ref: MutableRefObject<HTMLFormElement>, // For compatibility with <form/> 
  schema: ObjectSchema
): Record<string, any> {
  const [state, setState] = React.useState<Record<string, any>>({});

  const onFormUpdate = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    // @ts-ignore
    setState(s => update(s, {
      id: e.target.id,
      name: e.target.name ?? e.target.id,
      value: e.target.value,
      checked: e.target?.checked,
      schema
    }));
  };

  useEvent<HTMLFormElement>(
    "change", onFormUpdate as unknown as EventListener, ref?.current,
  );

  React.useEffect(() => {
    if (schema.properties) {
      const defaultState = getDefaultInstance(schema as JSONSchema);
      setState({ $schema: schema, ...defaultState });
    }
  }, [schema]);

  return state;
}


interface UseForm {
  ref: Ref<any>
  state: Record<string, any>,
  schema: ObjectSchema
}


/**
 * Given a `ddmd` string (`body`), create a ref to pass to a `<form>` element,
 * process the schema it contains, and track the state of the form.
 */
export const useForm = (body: string): UseForm => {
  const ref = React.useRef<HTMLFormElement>(null);
  const schema = useSchema(body);
  const state = useFormState(ref, schema);

  return { ref, state, schema };
};
