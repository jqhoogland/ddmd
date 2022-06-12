import React from "react";
import {remarkForms} from "remark-forms";
import {remarkPlotly} from "remark-plotly";
// @ts-ignore
import {PlotlyHTMLElement} from "@types/plotly.js";
import remarkParse from "remark-parse";
import ReactMarkdown from "react-markdown";
import {remarkCallout} from "../utils/remark-callout";
import {ReactMarkdownOptions} from "react-markdown/lib/react-markdown";
import {useForm} from "../hooks/remark-forms";
import {useGraphs} from "../hooks/remark-plotly";


interface RemarkFormProps extends ReactMarkdownOptions {
    children: string;
    onChangeState?: (state: Record<string, any>) => void;
}


/**
 * A wrapper around `<RemarkMarkdown/>` that adds support for `remark-forms`
 * and `remark-plotly`.
 */
const DataDrivenMD = ({children, onChangeState, ...props}: RemarkFormProps) => {
    const {ref, state, schema} = useForm(children);
    useGraphs(state, children);

    React.useEffect(() => {
        if (onChangeState) {
            onChangeState(state);
            console.log({state, schema})
        }
    }, [state])

    return (
        <form ref={ref}>
            <ReactMarkdown
                {...props}
                remarkPlugins={[
                    remarkParse,
                    remarkCallout,
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

export default DataDrivenMD
