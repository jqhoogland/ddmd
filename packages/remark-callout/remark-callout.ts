import {Root} from "hast";
import {visit} from "unist-util-visit";
import {Code} from "mdast";
import {h} from "hastscript";

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

