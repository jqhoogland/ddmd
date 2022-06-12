// @ts-ignore
import React from "react";
import { ObjectSchema, remarkForms} from "remark-forms";
import {remarkPlotly} from "remark-plotly";
// @ts-ignore
import {PlotlyHTMLElement} from "@types/plotly.js";
import ReactMarkdown from "react-markdown";
import {ReactMarkdownOptions} from "react-markdown/lib/react-markdown";
import {useForm, useGraphs} from "./hooks";



interface RemarkFormProps extends ReactMarkdownOptions {
  onChange?: (update: {state: Record<string, any>, schema: ObjectSchema}) => void;
}


/**
 * A `<form>` wrapper around `<RemarkMarkdown/>` that adds support for
 * `remark-forms` and `remark-plotly` & that tracks form state.
 */
const RemarkDDMD = ({children, onChange, ...props}: RemarkFormProps) => {
    const {ref, state, schema} = useForm(children);
    useGraphs(state, children);

    React.useEffect(() => {
        if (onChange) onChange({state, schema});
    }, [state, schema])

    return (
        <form ref={ref}>
            <ReactMarkdown
                {...props}
                remarkPlugins={[
                    remarkForms,
                    remarkPlotly,
                    ...(props?.remarkPlugins ?? [])
                ]}
            >
                {children}
            </ReactMarkdown>
        </form>
    )
}

export default RemarkDDMD
