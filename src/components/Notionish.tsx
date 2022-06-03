import {Avatar, Box, CardHeader, Container, Divider, Typography} from "@mui/material";
import React, {FormEvent, SyntheticEvent} from "react";
import {processMDToHTML, processSchema} from "../utils/md";
import { data } from "../utils/demo";
import {getInputType, JSONSchema, ObjectSchema} from "../utils/remark-ask/core";


/**
 * Attach an modify an event listener `callback` to `event` on `item`.
 */
function useEventListener<T extends HTMLElement, S extends SyntheticEvent>(item: T | undefined, event: string, callback: (e: S) => void) {
  const [{prev}, setCallback] = React.useState({prev: (e: S) => {}});

  React.useEffect(() => {
      if (item) {
          // @ts-ignore
          item.removeEventListener(event, prev);
          // @ts-ignore
          item.addEventListener(event, callback);
          setCallback({prev: callback});
      }
  }, [item, callback !== prev])
}

/**
 * Given a string representing CommonMark + Remark-Forms-style form blocks,
 * return the corresponding (stringified) html.
 */
function useMDToHTML(body: string, data: Record<string, any>): string {
    const [parsed, setParsed] = React.useState("");

    React.useEffect(() => {
        processMDToHTML(body, {data}).then(setParsed);
    }, [body]);

    return parsed;
}

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
        processSchema(body, {data}).then(setSchema);
    }, [body]);

    console.log("SCHEMA", schema)

    return schema;
}

function getValue(path: string[], prevValue: any, value: any, schema: JSONSchema): any {
    const optionEquals = (opt: any): boolean => (opt?.value ?? "").toString() === path?.[1];

    switch (getInputType(schema)) {
        case "radio":
            // @ts-ignore
            return schema.enum.find(optionEquals);
        case "checkbox":
            // TODO: Check / Unchecked
            if (!value) {
                return prevValue.value.filter((opt: any) => !optionEquals(opt));
            }

            // @ts-ignore
            return [
              ...(prevValue?.value ?? []),
              // @ts-ignore
              ...schema.items.enum.filter((opt: any) => optionEquals(opt))
            ];
        case "number":
            return {value: parseFloat(value)};
        case "quantity":
            return {value: parseFloat(value), units: schema.units};
        case "datetime":
        case "boolean":
        case "range":
        case "tel":
        case "email":
        case "url":
        case "string":
        case undefined:
        case "array":
            return {value};
    }
    return {value};
}


const update = (obj: Record<string, any> = {}, path: string[] = [], value: any = null, schema: ObjectSchema): Record<string, any> => {
    const name = path[0];
    const rest = path.slice(1, path.length);

    if (!(name in schema.properties)) {
        return {value}
    }

    const prevValue = obj[name];

    console.log({name, rest, obj, value, subschema: schema.properties[name], prevValue});

    if (rest.length === 0) {
        return {...obj, [name]: getValue(path, prevValue, value, schema.properties[name])}
    }

    return {
        ...obj,
        [name]: update(
            prevValue,
            rest,
            getValue(path, prevValue, value, schema.properties[name]),
            schema
        )
    }
}

function useFormState(schema: ObjectSchema) {
  const ref = React.useRef();
  const [state, setState] = React.useState<Record<string, any>>({});

  const onFormUpdate = (e: FormEvent) => {
      e.preventDefault();

      // @ts-ignore
      const path: string[] = e.target?.id.split("-");

      // @ts-ignore
      const value = (typeof e.target?.checked === "boolean")
          // @ts-ignore
          ? e.target?.checked
          // @ts-ignore
          : e.target.value;

      // @ts-ignore
      setState(s => update(s, path, value, schema));
  }
  useEventListener<HTMLInputElement, FormEvent>(ref.current, "change", onFormUpdate);

  console.log("STATE", state);

  return {ref, state}
}

const MD = ({ body, data={} }: { body: string, data?: Record<string, any> }) => {
  const bodyProcessed = useMDToHTML(body, data);
  const schema = useSchema(body);
  const {ref, state} = useFormState(schema);

  return (
      // @ts-ignore
      <form ref={ref}>
          <div dangerouslySetInnerHTML={{ __html: bodyProcessed }}/>
      </form>
  )
}

const Notionish = () => {
  const banner = "https://www.arrowsrestaurant.com/wp-content/uploads/2020/06/healthy.jpg";
  return (
    <>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@exampledev/new.css@1.1.2/new.min.css"/>
        <link rel="icon"
          href={`data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${data.icon}</text></svg>`}/>
        <title>{data.title}</title>
      </head>
        { banner && (
            <Box sx={{
                width: "100vw",
                position: "relative",
                left: 0,
                overflowY: "hidden",
                zIndex: -100,
                img: {
                    width: "100%",
                    maxHeight: "30vh",
                    objectFit: "cover",
                    objectPosition: "center",
                }
            }}>
                <img src={banner} alt={"banner"}/>
            </Box>
        )}
        <main>
            <Container maxWidth={"sm"} sx={{pt: 0, mt: -8}}>
            <Typography variant={"h2"} sx={{zIndex: 100}}>{data.icon}</Typography>
            <Typography variant="h4" sx={{fontWeight: "600"}}>{data.title}</Typography>
            <Divider sx={{my: 3}}/>
            <MD body={data.body}/>
            </Container>
        </main>
    </>
  )
}

export default Notionish
