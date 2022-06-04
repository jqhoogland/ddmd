/**
 * # Support for plotly... via markdown.
 *
 * Introduces a "plotly" codeblock:
 *

 */
import {Root} from "hast";
import {visit} from "unist-util-visit";
import {Code, Literal} from "mdast";
import yaml from "js-yaml";
import {unified} from "unified";
import remarkParse from "remark-parse";
import {Node} from "unist";
// @ts-ignore
import Plotly, {Config, Data, Layout, PlotlyHTMLElement} from "plotly.js-dist";
import _ from "lodash";


export interface GraphSchema {
    $id: string
    $deps?: {
        [key: string]: string
    },
    data: Data[],
    layout?: Partial<Layout>,
    config?: Partial<Config>,
}


export interface RemarkPlotlyOptions {
    codeBlockName?: string
    codeBlockParser?: (s: string) => Record<string, any>[],
}

export const remarkPlotly = (options?: RemarkPlotlyOptions) => {
    const {codeBlockName = "plotly", codeBlockParser = yaml.load} = options ?? {};
    return (tree: Root) => {
        // @ts-ignore
        visit(tree, {lang: codeBlockName}, (node: Code) => {
            // @ts-ignore
            try {
                const graph: GraphSchema = <GraphSchema>codeBlockParser(node.value);
                // @ts-ignore
                node.type = "HTML";
                node.data = {
                    hName: "div",
                    hProperties: {
                        id: graph.$id,
                        class: "graph"
                    }
                }
            } catch (e) {
                node.value = JSON.stringify(e, null, 2);
            }
        });
    };
}


export const getGraphSchemas = (tree: Node, options?: RemarkPlotlyOptions): GraphSchema[] => {
    const {codeBlockName = "plotly", codeBlockParser = yaml.load} = options ?? {};

    // @ts-ignore
    return tree.children.map((node: Literal) => {
        if (node.type !== "code" || (node as Code).lang != codeBlockName) return null;

        try {
            return <GraphSchema>codeBlockParser(node.value);
        } catch (e) {
            return null;
        }
    }).filter((graph: GraphSchema | null): boolean => !!graph);
}


export const parseGraphSchemas = (file: string, options?: RemarkPlotlyOptions): GraphSchema[] =>
    getGraphSchemas(unified().use(remarkParse).parse(file), options);


const CONFIG = {
    displayModeBar: false,
    staticPlot: true,
}

const LAYOUT = {
    margin: -10
}


export const plotGraphs = async (graphSchemas: GraphSchema[]): Promise<(PlotlyHTMLElement | null)[]> =>
    Promise.all(graphSchemas.map(async ({$id, data, layout}: GraphSchema) => {
        const graphEl = document.getElementById($id);

        if (graphEl) {
            return Plotly.newPlot(graphEl, data, {...layout, ...LAYOUT}, CONFIG);
        }
        return null;
    }));


/**
 * Extension to _.get that interprets `[]` as a map (as in `path[].field`).
 */
const getValue = (data: Record<string, any>, expression: string): any => {
    const path = expression.split("[].");
    let value = _.get(data, path[0]);

    path.slice(1, path.length).forEach((q: string) => {
        if (value === undefined) {
            value = [];
            return value;
        }
        value = value.map((item: any) => _.get(item, q));
    });

    return value;
}

const computeValue = (data: Record<string, any>, expression: string): any => {
    if (expression[0] !== "=") {
        throw "Expression should start with '='";
    }
    return getValue(data, expression.slice(1, expression.length));
}

const update = (obj: Data, deps: Record<string, any>, update: Record<string, any>) => {
    Object.entries(deps).forEach(([path, expression]) => _.set(obj, path, computeValue(update, expression)))
}


export const updateGraphs = (graphSchemas: GraphSchema[], state: Record<string, any>): Promise<(PlotlyHTMLElement | null)[]> =>
    Promise.all(graphSchemas.map(async ({$id, $deps = {}, data = [], layout = {}}: GraphSchema) => {
            const dataUpdated = {data, layout};
            update(dataUpdated, $deps, state);
            return Plotly.redraw(
                document.getElementById($id),
                dataUpdated.data,
                {...dataUpdated.layout, ...LAYOUT},
                CONFIG
            )
        }
    ));