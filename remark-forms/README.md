# remark-forms

[remark](https://github.com/remarkjs/remark) plugins to add support for forms.


## Installation

```shell
npm install remark-forms
```

## Usage

See [ddmd](../README.md).

To add an input to your field, add a new code block with `input` as its "language".
In this code block provide a [JSON Schema](https://cswr.github.io/JsonSchema/spec/) for the desired data and remark-form will automatically render an appropriate input.

#### Example (Text)

For example (using YAML to encode the schema):
````md
```input
$id: my_text_field
title: My Text Field
description: This happens to be a little text field. That is all.
type: string
```
````
converts to a text input:
```html
<div class="remark-forms-row">
  <div class="remark-forms-field remark-forms-text-field">
    <label 
      for="my_text_field" 
      id="my_text_field-label"
      class="remark-forms-label remark-forms-text-label"
    >
      My Text Field
    </label>  
    <p 
      id="my_text_field-description"
      class="remark-forms-description remark-forms-text-description"
    >
      This happens to be a little text field. That is all.
    </p>
    <input 
      type="text" 
      name="my_text_field"
      id="my_text_field" 
      class="remark-forms-input remark-forms-text-input"
      aria-describedby="my_text_field-description"
    >
  </div>  
</div>
```

The JSON Schema `title` and `description` are mapped to the input `label` and "helper text" respectively. 

If you wish to customize the html attributes, you can do so by including an additional `display` field in your schema definition.

// TODO: Currently these fields are included flat at the top level. Move them into display.
````md
```input
...
display:
  type: textarea
  rows: 5 
```
````

This will render a `textarea` instead of an `input[type="text"]`.

#### Text (Checkbox) 

For a more complex example, consider the following:

````md
```input
$id: checkboxes_id
title: My checkboxes
description: Some checkbox description
items: 
  enum:
  - $id: option_1
    value: 1
    label: One
  - $id: option_2
    value: 2
    label: Two
  - $id: option_3
    value: 3
    label: Three
  - $id: option_4
    value: 4 
    label: Four
  - $id: option_5
    value: 5
    label: Five
unique: true
```
````

renders checkboxes (a list of `unique` `items` taken from the given `enum`). 

```html
<div class="remark-forms-row">
  <div class="remark-forms-field">
    <!-- ... -->
    <div
      id="checkboxes_id"
      class="remark-forms-checkbox"
    > 
      <input 
        type="checkbox"
        id="checkboxes_id-option_1"
        name="checkboxes_id"
        class="remark-forms-checkbox-input"
        value="1"
      />
      <label 
        for="checkboxes_id-option_1"
        id="checkboxes_id-option_1-label"
        class="remark-forms-checkbox-label"
      >
        One  
      </label>  
    </div>
    <!-- ... -->
  </div>  
</div>
```

#### Example (Form Group)
It's also possible to create a "form group" by separating field schemas with the yaml document separator (`---`):

````md
```input
$id: field_1
title: Field 1
description: Lorem ipsum.
type: string
--- 
$id: field_2
title: Field 2
description: Lorem ipsum.
type: string
```
````

This creates two `div.remark-forms-field`'s under the same `div.remark-forms-row` parent item, which is useful if you want to display multiple inputs in the same row (which will require some additional styling, see [the example](../example/src/App.css)).

## API 

#### JSON Schema
Instead of specifying the attributes on the input elements directly, remark-forms has you specify a JSON schema for the desired data. It then automatically determines an appropriate input.

In cases of redundancy (e.g., radio vs. dropdown), it's possible to customize inputs via the `display` key. Usually though, our defaults are sensible enough that you don't have to worry about how inputs are rendered. We believe data structure should come before input display.

For more on JSON Schema, check out the [spec](https://cswr.github.io/JsonSchema/spec/).

#### Inputs
Remark-Forms supports all standard HTML input types except `reset` (which is not recommended) and `datetime` (which has been deprecated in favor of `datetime-local`).

We've also implemented a few custom input types (like a Likert table and a boolean toggle switch).

You can read more about the allowed inputs (and how to configure them) in the [docs](docs/inputs.md).

#### Other Form Elements
Remark-Forms also supports all non-input form elements (`<fieldset>`, `<legend>`, `<meter>`, `<output>`, `<progress>`, and `<button>`).

You can read more about how to create these elements in the [docs](docs/elements.md). 

#### Parser Options

// TODO


## Security

Use of `remark-forms` only makes sense if you also use [rehype](https://github.com/rehypejs/rehype) ([hast](https://github.com/syntax-tree/hast)), so you're opening yourself up to [cross-site scripting (XSS) attacks](https://github.com/rehypejs/rehype). Be careful.

## License

[MIT](../LICENSE.md) © [Health Curious](healthcurious.com)