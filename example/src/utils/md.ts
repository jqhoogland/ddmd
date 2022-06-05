import {Processor, unified} from "unified";
import remarkParse from "remark-parse";
import {remarkCallout} from "./remark-callout";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import {remarkForms, RemarkFormsOptions} from "remark-forms";
import {MdastRoot} from "remark-rehype/lib";
import {visit} from "unist-util-visit";
import {JSONSchema} from "remark-forms/core";
import {ObjectSchema} from "remark-forms/choice";
import {remarkPlotly} from "remark-plotly";


export const createProcessor = (options: RemarkFormsOptions): Processor =>
    unified()
        .use(remarkParse, {})
        .use(remarkCallout)
        .use(remarkForms, options)
        .use(remarkPlotly, {})
        .use(remarkRehype, {
            allowDangerousHtml: true,  // FIXME: DANGEROUS!
            passThrough: []
        })
        // .use(rehypeSanitize)
        .use(rehypeStringify)


export const processSchema = async (body: string, options: RemarkFormsOptions): Promise<ObjectSchema> => {
    const processor = createProcessor(options);
    const hastTree = <MdastRoot>await processor.run(processor.parse(body));

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
