import { visit } from 'unist-util-visit';
import { h } from 'hastscript';
import type { Root } from 'hast';
import type { Code } from 'mdast';

export const remarkCallout = () => (tree: Root) => {
  // @ts-expect-error
  visit(tree, { lang: 'callout' }, (node: Code) => {
    // @ts-expect-error
    node.type = 'blockquote';

    // @ts-expect-error
    node.data = {
      hName: 'pre',
      hProperties: {
        className: ['callout']
      },
      hChildren: [
        // @ts-expect-error
        h('h3', node?.meta),
        // @ts-expect-error
        h('p', node?.value)
      ]
    };
  });
};
