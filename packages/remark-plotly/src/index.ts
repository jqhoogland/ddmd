/**
 * # Support for plotly... via markdown.
 *
 * Introduces a "plotly" codeblock:
 *

 */
import { visit } from 'unist-util-visit';
import type { Code, HTML, Root } from 'mdast';
import yaml from 'js-yaml';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import Plotly from 'plotly.js';
import type { Config, Data, Layout, PlotlyHTMLElement } from 'plotly.js';
import _ from 'lodash';

export interface GraphSchema {
  /** Inspired by JSON Schema */
  $id: string;

  /** Links nested fields in data & layout to data in our global state.
   *
   * E.g.: `{"data.x[0]": "=response_0.value"}` will insert `response_0.value`
   * into the first entry of the `x` array in data.
   */
  $deps?: Record<string, string>;

  /** The rest of these are from plotly */
  data: Data[];
  layout?: Partial<Layout>;
  config?: Partial<Config>;
}

const defaultParser = (s: string) => yaml.load(s) as GraphSchema;

export interface RemarkPlotlyOptions {
  /** The code block "language" we should look for to convert to plots.
   * By default, looks for "plotly" code blocks.
   */
  codeBlockName?: string;

  /** A function that takes the contents in the code block and returns a js
   * object of its contents. By default we expect yaml, but you could use
   * json, toml, etc. */
  codeBlockParser?: (s: string) => GraphSchema;

  /** Whether to show errors in the code block if the parser fails.
   */
  showErrors?: boolean;
}

export const remarkPlotly = (options?: RemarkPlotlyOptions) => {
  const {
    codeBlockName = 'plotly',
    codeBlockParser = defaultParser,
    showErrors = false
  } = options ?? {};

  return (tree: Root) => {
    visit(tree, { lang: codeBlockName }, (node: Code) => {
      try {
        const graph = codeBlockParser(node.value);

        // Don't know a better way around this.
        // Ideally, visit would use an immutable mapping, but we have
        // to change `node` in-place.
        (node as unknown as HTML).type = 'html';
        node.data = {
          hName: 'div',
          hProperties: {
            id: graph.$id,
            class: 'graph'
          }
        };
      } catch (error) {
        // If the parser runs into problems, we put that inside the node.
        if (showErrors) {
          node.value = JSON.stringify(error, null, 2);
        } else {
          console.error(error);
        }
      }
    });
  };
};

export const getGraphSchemas = (
  tree: Root,
  options?: RemarkPlotlyOptions
): GraphSchema[] => {
  const { codeBlockName = 'plotly', codeBlockParser = defaultParser } =
    options ?? {};
  const schemas: GraphSchema[] = [];

  visit(tree, { type: 'code', lang: codeBlockName }, (node: Code) => {
    try {
      schemas.push(codeBlockParser(node.value));
    } catch (error) {
      console.error(error);
    }
  });

  return schemas;
};

export const parseGraphSchemas = (
  file: string,
  options?: RemarkPlotlyOptions
): GraphSchema[] =>
  getGraphSchemas(unified().use(remarkParse).parse(file), options);

const CONFIG = {
  displayModeBar: false,
  staticPlot: true
};

const LAYOUT = {
  margin: {
    t: -10,
    b: -10,
    l: -10,
    r: -10
  }
};

export const plotGraphs = async (
  graphSchemas: GraphSchema[]
): Promise<Array<PlotlyHTMLElement | undefined>> =>
  Promise.all(
    graphSchemas.map(async ({ $id, data, layout }: GraphSchema) => {
      const graphElement = document.getElementById($id);

      if (graphElement != null) {
        return Plotly.newPlot(
          graphElement,
          data,
          { ...layout, ...LAYOUT },
          CONFIG
        );
      }
    })
  );

/**
 * Extension to _.get that interprets `[]` as a map (as in `path[].field`).
 */
const getValue = (data: Record<string, any>, expression: string): any => {
  const path = expression.split('[].');
  let value = _.get(data, path[0]);

  path.slice(1, path.length).forEach((q: string) => {
    if (value === undefined) {
      value = [];
      return value;
    }

    value = value.map((item: any) => _.get(item, q));
  });

  return value;
};

const computeValue = (data: Record<string, any>, expression: string): any => {
  if (!expression.startsWith('=')) {
    throw "Expression should start with '='";
  }

  return getValue(data, expression.slice(1, expression.length));
};

const update = (
  object: Pick<GraphSchema, 'data' | 'layout'>,
  deps: Record<string, any>,
  update: Record<string, any>
) => {
  for (const [path, expression] of Object.entries(deps)) {
    _.set(object, path, computeValue(update, expression));
  }
};

export const updateGraphs = async (
  graphSchemas: GraphSchema[],
  state: Record<string, any>
): Promise<Array<PlotlyHTMLElement | undefined>> =>
  Promise.all(
    graphSchemas.map(
      async ({ $id, $deps = {}, data = [], layout = {} }: GraphSchema) => {
        const graphElement = document.getElementById($id);

        if (graphElement == null) {
          return null;
        }

        const dataUpdated = { data, layout };
        update(dataUpdated, $deps, state);

        // This is not very performant. There's better ways to do this.
        // https://community.plotly.com/t/what-is-the-most-performant-way-to-update-a-graph-with-new-data/639
        return Plotly.newPlot(
          graphElement,
          dataUpdated.data,
          { ...dataUpdated.layout, ...LAYOUT },
          CONFIG
        );
      }
    )
  );
