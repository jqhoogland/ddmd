import {ObjectSchema} from "remark-forms/dist/choice";
import React, {ChangeEvent, Ref} from "react";
import {processSchema} from "../utils/md";
import {useEventListener} from "./shared";
import {getDefaultInstance} from "remark-forms/dist/utils";
import {JSONSchema} from "remark-forms/dist/types";

/**
 * Given a string representing a Remark-Forms document, returns the JSON schema
 * for the form as a whole (where `$id`s become the keys of the form).
 */
function useSchema(body: string): ObjectSchema {
    const [schema, setSchema] = React.useState<ObjectSchema>( {
        $id: "form",
        type: "object",
        properties: {}
    });

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
function useFormState(ref: Ref<any>, schema: ObjectSchema): Record<string, any> {
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
  }
  useEventListener<HTMLInputElement, ChangeEvent<HTMLInputElement>>(ref.current, "change", onFormUpdate);

  // use Defaults on Mount
  React.useEffect(() => {
      if (schema.properties) {
          const defaultState = getDefaultInstance(schema as JSONSchema);
          setState({$schema: schema, ...defaultState});
      }
  }, [schema])

  return state
}



interface UseForm {
    ref: Ref<any>
    state: Record<string, any>,
    schema: ObjectSchema
}


export const useForm = (body: string): UseForm => {
  const ref = React.useRef();
  const schema = useSchema(body);
  const state = useFormState(ref, schema);

  return {ref, state, schema};
}

