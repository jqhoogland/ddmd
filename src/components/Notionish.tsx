import { Avatar, Box, CardHeader, Container, SxProps, Typography } from "@mui/material";
import remarkParse from "remark-parse";
import { unified } from "unified";
import React from "react";
import remarkRehype from "remark-rehype";
// @ts-ignore
import { encode } from "https://deno.land/std/encoding/base64.ts";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import { Root } from "hast";
import rehypeSanitize from "rehype-sanitize";
import { h } from "hastscript";
import {Code} from "mdast"

const BODY = `
# Hello

This is a body.

---

\`\`\`question
ref: some_name
code: 123
system: LOINC
\`\`\`  

\`\`\`callout 📈
Cum devirginato experimentum, omnes magisteres perdere camerarius, bassus humani generises.
\`\`\`


\`\`\`js
const something = "something";
\`\`\`


HMMM

- a list
  - of elements
  - and more
- and more
- and more...

a *little* **interm**

1. One
2. Two
  1. Three
  2. Four
  
> And a block quote

Cur habitio unda Festus hydras ducunt ad messor. Aususs messis!? \`codeas o125\` Vae, domus! Vae, heuretes!

`

const data = {
  id: "123",
  title: "Some title",
  icon: "🦀",
  body: BODY
}

const mdSx: SxProps = {
  "h1,h2,h3,h4,h5,h6,p,span,a,li,ol,blockquote": {
    fontFamily: "Roboto"
  },
  "ul,ol": {
    paddingInlineStart: "1.5em",
  },
  "li": {
    pl: "0.5em"
  },
  "blockquote": {
    borderLeft: "0.20em solid black",
    m: 0,
    pl: "0.5em",
    py: "0.25em"
  },
  "blockquote p:first-child": {
    mt: 0
  },
  "blockquote p:last-child": {
    mb: 0
  },
  "code, pre,.callout": {
    bgcolor: "#f5f2f0",
    borderRadius: "0.5em"
  },
  "code": {
    p: "0.125em",
    color: "#EC5656"
  },
  "pre": {
    p: "1.5em",
  },
  "pre code": {
    color: "black",
    overflowX: "scroll"
  },
  ".callout": {
    display: "flex",
    flexDirection: "row",
    whiteSpace: "pre-wrap",
    alignItems: "baseline",
    px: "1.5em"
  },
  ".callout h3": {
    mr: "0.5em",
  },
  "hr": {
    my: "1em",
    border: 0,
    borderTop: "0.05em solid #d5d2d0",
  }
}

const remarkCallout = () => {
  return (tree: Root) => {
    visit(tree, console.log)
    // @ts-ignore
    visit(tree, { lang: "callout" }, (node: Code) => {
      // @ts-ignore
      node.type = "blockquote";

      // @ts-ignore
      node.data = {
        hName: "div",
        hProperties: {
          className: ["callout"],
        },
        hChildren: [
          // @ts-ignore
          h("h3", node?.meta),
          // @ts-ignore
          h("p", node?.value)
        ]
      }
      console.log(node)

    })
  };
}

const MD = ({ body }: { body: string }) => {
  const [bodyProcessed, setBodyProcessed] = React.useState<any>();

  React.useEffect(() => {
      unified()
        .use(remarkParse, {})
        .use(remarkCallout)
        .use(remarkRehype, {
          allowDangerousHtml: true,
          passThrough: []
        })
        // .use(rehypeSanitize)
        .use(rehypeStringify)
        .process(body)
        .then(file => file.value)
        .then(setBodyProcessed)
    }, [body]
  )
  return (<Box sx={mdSx}>
    <div dangerouslySetInnerHTML={{ __html: bodyProcessed }}/>
  </Box>)
}

const Notionish = () => {
  return (
    <Container maxWidth={"md"}>
      <head>
        <link rel="icon"
              href={`data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${data.icon}</text></svg>`}/>
        <title>{data.title}</title>
      </head>
      <CardHeader
        avatar={<Avatar>{data.icon}</Avatar>}
        header={<Typography variant={"h6"}>{data.title}</Typography>}
      />
      <MD body={data.body}/>
    </Container>
  )
}

export default Notionish
