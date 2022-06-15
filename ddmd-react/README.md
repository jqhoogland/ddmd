# ddmd (example)

Example of data-driven markdown + React.

## Setup

```shell
cd example
npm i
npm run start
```

If you're working on either `remark-forms` or `remark-plotly`, you can run 
`tsc --watch` in the same directory. 

## SSR

Note: `plotly.js` doesn't support SSR (it requires access to global `self`), so
for the time being, you should wrap this component in a dynamic import 
(if you're using Next.JS or something comparable.)