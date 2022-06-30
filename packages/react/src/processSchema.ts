import { Processor, unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import {
  remarkForms,
  JSONSchema,
  ObjectSchema,
  RemarkFormOptions
} from '@ddmd/remark-forms/src';
import { visit } from 'unist-util-visit';
import { MdastRoot } from 'remark-rehype/lib';

export const createProcessor = (options: RemarkFormOptions): Processor =>
  unified().use(remarkParse, {}).use(remarkForms, options).use(remarkRehype, {
    allowDangerousHtml: true, // FIXME: DANGEROUS!
    passThrough: []
  });

const processSchema = async (
  body: string,
  options: RemarkFormOptions
): Promise<ObjectSchema> => {
  const processor = createProcessor(options);
  const hastTree = (await processor.run(processor.parse(body))) as MdastRoot;

  const schema: ObjectSchema = {
    $id: 'form',
    type: 'object',
    properties: {}
  };

  // @ts-expect-error
  visit(
    hastTree,
    (node) => Boolean(node.properties?.schema),
    (node) => {
      // @ts-expect-error
      node.properties.schema.map((field: JSONSchema) => {
        schema.properties[field.$id] = field;
      });
      // @ts-expect-error
      delete node.properties.schema;
    }
  );

  return schema;
};

export default processSchema;
