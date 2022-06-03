import {Processor, unified} from "unified";
import remarkParse from "remark-parse";
import {remarkCallout} from "./remark-callout";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import {remarkAsk, RemarkAskOptions} from "./remark-ask";
import {MdastRoot} from "remark-rehype/lib";
import {visit} from "unist-util-visit";
import {Node, HProperties} from "hastscript/lib/core";
import {JSONSchema} from "./remark-ask/core";
import {ObjectSchema} from "./remark-ask/choice";

export const createProcessor = (options: RemarkAskOptions): Processor =>
    unified()
        .use(remarkParse, {})
        .use(remarkCallout)
        .use(remarkAsk, options)
        .use(remarkRehype, {
          allowDangerousHtml: true,  // FIXME: DANGEROUS!
          passThrough: []
        })
        // .use(rehypeSanitize)
        .use(rehypeStringify)


export const processMDToHTML = async (body: string, options: RemarkAskOptions): Promise<string> =>
    createProcessor(options).process(body).then(s => s.toString());


export const processSchema = async (body: string, options: RemarkAskOptions): Promise<ObjectSchema> => {
    const processor = createProcessor(options);
    const hastTree = <MdastRoot> await processor.run(processor.parse(body));

    const schema: ObjectSchema = {
        $id: "form",
        type: "object",
        properties: {}
    };

    // @ts-ignore
    visit(hastTree, node => !!node.properties?.schema, node => {
        // @ts-ignore
        node.properties.schema.map((field: JSONSchema) => {
            schema.properties[field.$id] = field;
        })
        // @ts-ignore
        delete node.properties.schema;
    });

    return schema
}
