import type { ObjectSchema, JSONSchema } from "@ddmd/remark-forms/";
import React, { ChangeEvent, MutableRefObject } from "react";
import processSchema from "../processSchema";
import { getDefaultInstance } from "@ddmd/remark-forms/dist/utils";
import { update } from "@ddmd/remark-forms";
import useEvent from 'react-use/esm/useEvent';

/**
 * Given a string representing a Remark-Forms document, returns the JSON schema
 * for the form as a whole (where `$id`s become the keys of the form).
 */
const useSchema = (body: string): ObjectSchema | undefined => {
  const [schema, setSchema] = React.useState<ObjectSchema | undefined>();

  React.useEffect(()  => {
    processSchema(body, {}).then(setSchema);
  }, [body])

  return schema;
}
  

/**
 * Given a `ref` to a `<form/>` element and a json `schema` that describes the
 * contents of that form, return the active instance of the `schema`
 * contained in the form.
 */
const useFormState = (
  ref: MutableRefObject<HTMLFormElement | null>,
  schema: ObjectSchema | undefined
): Record<string, any> => {
  const [state, setState] = React.useState<Record<string, any>>({});

  const onFormUpdate = React.useCallback((e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (schema) {
      setState(s => update(s, {
        id: e.target.id,
        name: e.target.name ?? e.target.id,
        value: e.target.value,
        checked: e.target?.checked,
        schema
      }));
    }
  }, [schema]);

  useEvent<HTMLFormElement>(
    "change", onFormUpdate as unknown as EventListener, ref?.current,
  );

  React.useEffect(() => {
    if (schema?.properties) {
      const defaultState = getDefaultInstance(schema as JSONSchema);
      setState({ $schema: schema, ...defaultState });
    }
  }, [schema]);

  return state;
}


interface UseForm {
  state: Record<string, any>,
  schema: ObjectSchema | undefined
}


/**
 * Given a `ddmd` string (`body`), create a ref to pass to a `<form>` element,
 * process the schema it contains, and track the state of the form.
 */
export const useForm = (ref: MutableRefObject<HTMLFormElement | null>, body: string): UseForm => {
  const schema = useSchema(body);
  const state = useFormState(ref, schema);
     
  return { state, schema};
};
