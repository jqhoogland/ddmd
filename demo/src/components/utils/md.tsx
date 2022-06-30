import { unified } from 'unified';
import type { Literal } from 'hast';
import remarkParse from 'remark-parse';
import remarkFrontmatter from 'remark-frontmatter';
import { MdastNode } from 'mdast-util-to-hast/lib';
import * as yaml from 'js-yaml';

interface PageData {
  title: string;
  icon: string;
  banner?: string;
  body: string;
}

// TODO: This is probably overkill. It'd be cheaper to slice out the
//       frontmatter and run yaml.load directly.
export const getFrontmatter = (md: string): Omit<PageData, 'body'> => {
  const tree = unified()
    .use(remarkParse)
    .use(remarkFrontmatter, ['yaml'])
    .parse(md);

  const frontmatterElement = tree.children.find(
    (node: MdastNode) => node.type === 'yaml'
  );
  return yaml.load((frontmatterElement as Literal).value) as Omit<
    PageData,
    'body'
  >;
};

export const getPageData = (md: string) => {
  const frontmatter = getFrontmatter(md);
  const body = md.slice(md.indexOf('---', 4) + 4, md.length);
  return { ...frontmatter, body };
};
