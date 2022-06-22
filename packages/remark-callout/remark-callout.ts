import {visit} from "unist-util-visit";
import {h} from "hastscript";
import type {Root} from "hast";
import type {Code} from "mdast";

export const remarkCallout = () => {
  return (tree: Root) => {
    // @ts-ignore
    visit(tree, { lang: "callout" }, (node: Code) => {
      // @ts-ignore
      node.type = "blockquote";

      // @ts-ignore
      node.data = {
        hName: "pre",
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
    })
  };
}

