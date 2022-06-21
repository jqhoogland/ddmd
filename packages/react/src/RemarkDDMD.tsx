import React, { ForwardedRef, MutableRefObject, useRef } from "react";
import { ObjectSchema, remarkForms } from "@ddmd/remark-forms";
import { remarkPlotly } from "@ddmd/remark-plotly";
import ReactMarkdown from "react-markdown";
import { ReactMarkdownOptions } from "react-markdown/lib/react-markdown";
import { useForm } from "./hooks";
import { useGraphs } from "./hooks/remark-plotly";


interface RemarkFormProps extends ReactMarkdownOptions {
  onChange?: (update: { state: Record<string, any>, schema: ObjectSchema | undefined }) => void;
}


/**
 * A `<form>` wrapper around `<RemarkMarkdown/>` that adds support for
 * `remark-forms` and `remark-plotly` & that tracks form state.
 */
const RemarkDDMD: React.FC<RemarkFormProps> = ({ children, onChange, ...props }) => {
  const ref = useRef<HTMLFormElement | null>(null);
  const { state, schema } = useForm(ref, children);
  useGraphs(state, children);

  React.useEffect(() => {
    onChange?.({ state, schema });
  }, [state, schema, onChange]);

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
  );
};

export default RemarkDDMD;