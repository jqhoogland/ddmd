import {Avatar, Box, CardHeader, Container, Divider, Typography} from "@mui/material";
import React, {ChangeEvent, FormEvent, SyntheticEvent} from "react";
import {processMDToHTML, processSchema} from "../utils/md";
import { data } from "../examples/demo";
import {getInputType, InputType, JSONSchema} from "../../../remark-forms/core";
import {enumToChoice, isLikert, LikertAnswer, LikertSchema, ObjectSchema} from "../../../remark-forms/choice";
import {GraphSchema, parseGraphSchemas, plotGraphs, updateGraphs} from "../../../remark-plotly/core";
// @ts-ignore
import {PlotlyHTMLElement} from "@types/plotly.js";
import {JSONSchema7} from "json-schema";
import {getDefaultInstance} from "../../../remark-forms/utils";


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

    return schema;
}

type Value<T> = {
    string: T
    [key: string]: any
};

interface BaseUpdateOptions {
    id: string;
    name: string;
    value: any;
    checked?: boolean;
}

interface UpdateValueOptions extends BaseUpdateOptions {
    schema: JSONSchema,
    type: InputType
}

function getValue(prevValue: Value<any>, {id, name, value, checked, type, schema}: UpdateValueOptions): any {

    const optionEquals = (opt: any): boolean => (opt?.value ?? "").toString() === name;

    switch (type) {
        case "radio":
            // @ts-ignore
            return schema.enum.find(optionEquals);
        case "checkbox":
            if (!checked) {
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
    }
    return {value};
}


interface UpdateLikertOptions extends BaseUpdateOptions {
    questionIdx: number;
    answerValue: string;
    schema: LikertSchema;
}

const updateLikert = (obj: Record<string, any>, {id, questionIdx, answerValue, schema, name}: UpdateLikertOptions): Record<string, any> => {
    const defaultAnswers = schema.items.map(
            (schema: JSONSchema7) => ({$schema: schema, value: null}));
    const prevAnswers = obj[id] ?? defaultAnswers;

    const choice = enumToChoice(
        // @ts-ignore
        schema.$defs.choices.enum
            .find((item: { const: any }) => item.const.toString() === answerValue)
    );
    const answer: LikertAnswer = {...prevAnswers[questionIdx], ...choice};
    const answers = prevAnswers.map((prev: LikertAnswer) => (prev.$schema.$id === answer.$schema.$id ? answer : prev));

    answers.$schema = schema;

    return {
        ...obj,
        [id]: answers,
        [name]: answer
    }
}

interface UpdateOptions extends BaseUpdateOptions {
    schema: ObjectSchema;
}

const updateNested = (obj: Record<string, any>, {id, schema, ...options}: UpdateOptions): Record<string, any> => {
    const [rootID, ...rest] = id.split("-");
    const fieldSchema = schema.properties?.[rootID];

    if (fieldSchema && isLikert(fieldSchema)) {
        return updateLikert(obj, {
            questionIdx: parseInt(rest[0]),
            answerValue: rest[1],
            id: rootID,
            schema: fieldSchema as LikertSchema,
            ...options
        })
    }

    throw "Oops!"
}

const updateFlat = (obj: Record<string, any>, {id, schema, name, ...options}: UpdateOptions): Record<string, any> => {
    const fieldSchema = schema.properties?.[id];

    if (fieldSchema) {
        const type = getInputType(fieldSchema);

        return {
            ...obj,
            [name]: getValue(obj[name], {name, type, schema: fieldSchema, id, ...options})
        }
    }
    throw "Oops! Flat."
}


const update = (obj: Record<string, any> = {}, options: UpdateOptions): Record<string, any> => {
    if (options.id.includes("-")) {
        return updateNested(obj, options)
    }

    return updateFlat(obj, options);
}

function useFormState(schema: ObjectSchema) {
  const ref = React.useRef();
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

    console.log("STATE", {state})

  return {ref, state}
}

const useGraphs = (state: any, body: string, render: string): [(PlotlyHTMLElement | null)[], GraphSchema[]] => {
    const [elements, setElements] = React.useState<(PlotlyHTMLElement | null)[]>([]);
    const [schemas, setSchemas] = React.useState<GraphSchema[]>([]);

    React.useEffect(() => {
        if (render) {
            const graphSchemas = parseGraphSchemas(body);
            setSchemas(graphSchemas);
            plotGraphs(graphSchemas).then(setElements);
        }
    }, [render])


    React.useEffect(() => {
        console.log("Updating")
        if (schemas) {
            updateGraphs(schemas, state);
        }
    }, [schemas, state])

    console.log("GRAPHS", {graphs: schemas})

    return [elements, schemas]
}

const MD = ({ body, data={} }: { body: string, data?: Record<string, any> }) => {
  const bodyProcessed = useMDToHTML(body, data);
  const schema = useSchema(body);
  const {ref, state} = useFormState(schema);
  useGraphs(state, body, bodyProcessed);

  return (
      // @ts-ignore
      <form ref={ref}>
          <div dangerouslySetInnerHTML={{ __html: bodyProcessed }}/>
      </form>
  )
}

const getIconHref = (emoji: string): string => `data:image/svg+xml,
<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22>
  <text y=%22.9em%22 font-size=%2290%22>${emoji}</text>
</svg>`;

const getFaviconEl = (): HTMLLinkElement => document.getElementById("favicon") as HTMLLinkElement;


const Notionish = () => {
    const hasBanner = !!data.banner;

  React.useEffect(() => {
      getFaviconEl().href = getIconHref(data.icon);;
  }, []);

  return (
    <>
      <head>
        <title>{data.title}</title>
      </head>
        { hasBanner && (
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
                <img src={data.banner} alt={"banner"}/>
            </Box>
        )}
        <main>
            <Container maxWidth={"sm"} sx={{pt: hasBanner ? 0 : 5, mt: hasBanner ? -8 : 0 }}>
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
