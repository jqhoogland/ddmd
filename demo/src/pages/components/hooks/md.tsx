import {unified} from "unified";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import {MdastNode} from "mdast-util-to-hast/lib";
import * as yaml from "js-yaml";
import {FrontmatterContent} from "mdast";
import React from "react";
import { useRouter } from "next/router";


interface PageData {
    title: string;
    icon: string;
    banner?: string;
    body: string;
}


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
export const useFetchMD = (): PageData => {
    const [data, setData] = React.useState({title: "Loading...", icon: "", body: ""});
    const router = useRouter();

    React.useEffect(() => {
        if (["demo-1", "demo-2"].indexOf(router.pathname) < 0) {
            setData(getData(""))
        } else {
            // TODO: Can we do this with a dynamic import instead?
            fetch(`/${router.pathname}.md`)
                .then((response: Response) => response.text())
                .then((doc: string) => setData(getData(doc)))
        }
    }, [router.pathname])

    return data
}

