import {visitParents} from "unist-util-visit-parents";
import {findAfter} from "unist-util-find-after";
import type { Node, Data } from "unist";
import type {Literal, Root} from "hast";
import type {Content, Heading, Paragraph, Parent, Text} from "mdast";


const getParagraphValue = (node: Paragraph): string | undefined =>
    (node.children?.[0] as Literal)?.value;


const isFieldsetValueEnd = (value?: string): boolean =>
    value === "--- /"


const isParagraph = (node: Node<Data>): node is Paragraph => node.type === "paragraph";

const isFieldsetEnd = (node: Node<Data>): boolean =>
    isParagraph(node) && isFieldsetValueEnd(getParagraphValue(node));


const isFieldsetValueStart = (value?: string): boolean =>
    !!value && value.length > 4 && value.slice(0, 4) === "--- " && !isFieldsetValueEnd(value);


const isFieldsetStart = (node: Node<Data>): boolean =>
    isParagraph(node) &&  isFieldsetValueStart(getParagraphValue(node));


/**
 * Converts `"--- Some Text"` or `"--- ## Some Title"` to
 * `<legend class="remark-forms-legend">Some Text</legend>` and
 * `<legend class="remark-forms-legend"><h2>Some Title</h2></legend>`,
 * respectively.
 */
function getLegendContent(fieldsetStart: string): Heading | Text {
    const value = fieldsetStart.slice(4, fieldsetStart.length);

    let depth: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0;
    for (let c of value) {
        if (c !== "#") break;
        depth += 1;
    }

    if (depth !== 0) {
        return {
            type: "heading",
            // @ts-ignore
            depth,
            children: [{type: "text", value: value.slice(depth + 1, value.length)}],
        }
    }

    return {
        type: "text",
        value
    } as Text
}

interface LegendNode extends Parent {
    type: "legend",
}


const getLegend = (node: Paragraph): LegendNode => ({
    type: "legend",
    data: {hName: "legend"},
    children: [getLegendContent(getParagraphValue(node) ?? "") as Content]
})


/**
 * Based on [remark-sectionize](https://github.com/jake-low/remark-sectionize/blob/master/index.js)
 * TODO: Add support for a `meta` attribute (like on code blocks).
 *       As in `--- My legend & title {extra=}
 *
 */
export const parseFieldsets = (tree: Root) => {
    // @ts-ignore
    visitParents(tree, isFieldsetStart, (start: Paragraph, ancestors: Parent[]) => {
        const parent = ancestors[ancestors.length - 1];
        const end = findAfter(parent, start, isFieldsetEnd) as Paragraph;

        const startIndex = parent.children.indexOf(start);
        const endIndex = parent.children.indexOf(end);

        const between = parent.children.slice(
            startIndex + 1,
            endIndex > 0 ? endIndex : undefined
        )

        const fieldset = ({
            type: "fieldset",
            children: [
                getLegend(start),
                ...between
            ],
            data: {
                hName: "fieldset"
            }
        } as unknown) as Content;

        parent.children.splice(startIndex, between.length + 2, fieldset)
    })
}
