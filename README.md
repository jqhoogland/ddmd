# ddmd
### Data-Driven Markdown

[remark](https://github.com/remarkjs/remark) plugins to add support for forms ([remark-forms](/remark-forms)) and graphing via plotly ([remark-plotly](/remark-plotly)).


## Installation

```shell
npm install remark-forms remark-plotly
```

#### Ok so actually you don't have to do any of the following, I'm just leaving it up as a testament to a futile bug hunting effort that cost me an entire morning.

While developing, you'll want to take advantage of [`npm link`](https://docs.npmjs.com/cli/v8/commands/npm-link).
And be careful with this [gotcha](https://medium.com/bbc-design-engineering/solving-the-problem-with-npm-link-and-react-hooks-266c832dd019).

- After installing packages (`npm i`) in all four packages...
- Run `npm link ../remark-plotly ../remark-forms` in `ddmd-react` and `demo`.
- Run `npm link ../ddmd-react ../ddmd-react/node_modules/react ../ddmd-react/node_modules/react-dom` in `demo`. 




## Demo

### \<Insert GIF Here\>
// TODO ...

## Usage

Say we have the following file `example.md`:

````md

# My Form

```question
$id: field_1
title: Question 1
description: Fill in a number please.
type: number
```

```plotly
$id: plot_1
data: 
- x: [1, 2, 3, 4]
  y: [10, 15, 13, 17]
  type: "scatter"
- x: [1, 2, 3, 4]
  y: [16, 5, 11, 9]
  type: "scatter"

```
````

And our module `example.js` looks like this:

```js
import {readSync} from 'to-vfile'
import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkForm from 'remark-form'
import remarkPlotly from 'remark-plotly'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
 
unified()
    .use(remarkParse)
    .use(remarkForm)
    .use(remarkPlotly)
    .use(rehypeStringify)
    .process(readSync("example.md"))
    .then(file => console.log(String(file)));

```

Running this file (and applying some formatting) will give us:

```html
// TODO
```

## API 

- [remark-forms](./remark-forms/README.md)
- [remark-plotly](./remark-plotly/README.md)


## Security

Use of `remark-form` and `remark-plotly` only make sense if you also use [rehype](https://github.com/rehypejs/rehype) ([hast](https://github.com/syntax-tree/hast)), so you're opening yourself up to [cross-site scripting (XSS) attacks](https://github.com/rehypejs/rehype). Be careful.

## License

[MIT](./LICENSE.md) © [Health Curious](healthcurious.com)