import {PlotlyHTMLElement} from "plotly.js";
import {GraphSchema, parseGraphSchemas, plotGraphs, updateGraphs} from "remark-plotly";
import React from "react";

export const useGraphs = (state: any, body: string): [(PlotlyHTMLElement | null)[], GraphSchema[]] => {
    const [elements, setElements] = React.useState<(PlotlyHTMLElement | null)[]>([]);
    const [schemas, setSchemas] = React.useState<GraphSchema[]>([]);

    React.useEffect(() => {
        const graphSchemas = parseGraphSchemas(body);
        setSchemas(graphSchemas);
        plotGraphs(graphSchemas).then(setElements);
    }, [body])


    React.useEffect(() => {
        if (schemas) {
            updateGraphs(schemas, state);
        }
    }, [schemas, state])

    return [elements, schemas]
}