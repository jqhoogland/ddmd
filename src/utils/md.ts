import {SxProps} from "@mui/material";
import {Processor, unified} from "unified";
import remarkParse from "remark-parse";
import {remarkCallout} from "./remark-callout";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import {remarkAsk} from "./remark-ask";

export const mdSx: SxProps = {
  "code, pre,.callout": {
    bgcolor: "#f5f2f0",
    borderRadius: "0.5em",
    my: "0.5em"
  },
  "code": {
    color: "#EC5656"
  },
  "pre code": {
    color: "black",
    overflowX: "scroll"
  },
  ".callout": {
    fontFamily: "var(--nc-font-sans)",
    display: "flex",
    flexDirection: "row",
    whiteSpace: "pre-wrap",
    alignItems: "baseline",
    px: "1.5em"
  },
  ".callout h3": {
    mr: "0.5em",
  },
  ".form-row": {
    display: "flex",
    flexDirection: ["column", "row"],
    justifyContent: "space-between"
  },
  ".form-row :not(.form-field:last-child)": {
    pr: 0.5
  },
  ".form-field": {
    display: "flex",
    flexDirection: "column",
    width: "100%"
  },
  ".form-field label": {
    fontWeight: "600"
  },
  ".form-field span": {
    opacity: "80%",
    fontSize: ".9rem",
    pb: 0.5
  },
  ".form-radio": {
    display: "flex",
    flexDirection: ["column", "row"],
    alignItems: "baseline"
  },
  ".form-radio label": {
    pl: 0.75,
  },
  ".form-field > .form-radio :not(.form-radio-item:last-child)": {
    pr: 5
  }
}

export const createProcessor = (): Processor =>
    unified()
        .use(remarkParse, {})
        .use(remarkCallout)
        .use(remarkAsk)
        .use(remarkRehype, {
          allowDangerousHtml: true,  // FIXME: DANGEROUS!
          passThrough: []
        })
        // .use(rehypeSanitize)
        .use(rehypeStringify)


export const parseMDToHTML = async (body: string): Promise<string> => createProcessor()
        .process(body)
        .then(file => String(file.value))