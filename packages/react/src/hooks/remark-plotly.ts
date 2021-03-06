import { PlotlyHTMLElement } from 'plotly.js';
import type { GraphSchema } from '@ddmd/remark-plotly/src';
import {
  parseGraphSchemas,
  plotGraphs,
  updateGraphs
} from '@ddmd/remark-plotly/src';
import React from 'react';

/**
 * TODO: Glaring problem here. Plotly requires global self which is not
 *       defined in Node environments (so you can't use this in SSR &
 *       have to use a dynamic import).
 *       See: https://github.com/plotly/react-plotly.js/issues/273
 *
 * We don't like this (we don't want users to see a configuration codeblock
 * that will undergo lots of content shift  on first load.
 * So either hide some of this behind requires or try a different viz library,
 * maybe vegalite?
 *
 * There's a bigger problem which is that Plotly is huge and not tree shakeable.
 * Probably time to find another library.
 *
 * @param state An object of `id`- value objects.
 * @param body The original .md file.
 * @returns
 */
export const useGraphs = (
  state: any,
  body: string
): [Array<PlotlyHTMLElement | undefined>, GraphSchema[]] => {
  const [elements, setElements] = React.useState<
    Array<PlotlyHTMLElement | undefined>
  >([]);
  const [schemas, setSchemas] = React.useState<GraphSchema[]>([]);

  React.useEffect(() => {
    // "useMountGraph"
    const graphSchemas = parseGraphSchemas(body);
    setSchemas(graphSchemas);
    plotGraphs(graphSchemas).then(setElements);
  }, [body]);

  React.useEffect(() => {
    // "useUpdateGraph"
    if (schemas) {
      updateGraphs(schemas, state);
    }
  }, [schemas, state]);

  return [elements, schemas];
};
