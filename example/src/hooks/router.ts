import {unified} from "unified";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import {MdastNode} from "mdast-util-to-hast/lib";
import * as yaml from "js-yaml";
import {FrontmatterContent} from "mdast";
import React from "react";


interface PageData {
    title: string;
    icon: string;
    banner?: string;
    body: string;
}


const FALLBACK = `---
title: Datadriven Markdown
icon: 📀
---

- [Demo 1](/demo-1)
- [Demo 2](/demo-2)

`


// TODO: This is probably overkill. It'd be cheaper to slice out the
//       frontmatter and run yaml.load directly.
const getFrontmatter = (md: string): Omit<PageData, "body"> => {
    const tree = unified()
        .use(remarkParse)
        .use(remarkFrontmatter, ['yaml'])
        .parse(md);

    const frontmatterEl = tree.children.find((node: MdastNode) => node.type === "yaml");
    return (yaml.load((frontmatterEl as FrontmatterContent).value) as unknown) as Omit<PageData, "body">
}


const getData = (md: string) => {
    const frontmatter = getFrontmatter(md);
    const body = md.slice(md.indexOf("---", 4) + 4, md.length);
    return {...frontmatter, body}
}


/**
 * Load the markdown file (if it exists) corresponding to the current path
 * under `public`. Then, strip the frontmatter, and read this into a dictionary
 * along with the remaining `body`.
 *
 * If the file doesn't exist, renders `FALLBACK` instead.
 */
export const useMdRouter = (): PageData => {
    const [data, setData] = React.useState({title: "Loading...", icon: "", body: ""});

    React.useEffect(() => {
        const href = window.location.href;
        const relPath = href.slice(href.lastIndexOf("/") + 1, href.length);

        if (["demo-1", "demo-2"].indexOf(relPath) < 0) {
            setData(getData(FALLBACK))
        } else {
            // TODO: Can we do this with a dynamic import instead?
            fetch(`/${relPath}.md`)
                .then((response: Response) => response.text())
                .then((doc: string) => setData(getData(doc)))
        }
    }, [])

    return data
}