# Input Types

// TODO: Dual use of "type" is confusing. Maybe "variant" instead?
// It also doesn't map perfectly onto the natural displays

## Attributes
- `autocomplete`: see [this page](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete).
- `disabled`
- `list`: set indirectly by specifying an `enum` instead.
- `value`: you can set the initial value by specifying `default` on the JSON schema


## Text

#### Short (`<input type="text">`)
- `type="string"`

#### Long (`<textarea>`)

`type="string"` and `display.type="textarea"`

#### Password (`<input type="password">`)
`type="string" and `display.password=true`.

#### Attributes
Set`maxlength` or`minlength` via`maxLength` or`minLength` on the schema (note the capitalization).

## Date & Time

#### Datetime (`<input type="datetime-local">`)
`type="string"` and `format="date-time"`

#### Date (`<input type="date">`)
`type="string"` and `format="date"`

#### Time (`<input type="time">`)
`type="string"` and `format="time"`

#### Year & Month (`<input type="month">`)
`type="string"` and `format="month"` // TODO Implement & check the regex below
Note this a non-standard format (that gets mapped to`pattern="\d{4}\-[(0[1-9])|(10)|(11)|(12)]"`, i.e.,`yyyy-mm`) 

#### Year & Week (`<input type="week">`)
`type="string"` and `format="week"` // TODO Implement & check the regex below
  
Note: this is a non-standard format (it's not included in the JSON schema spec). 
Behind the scenes, this gets mapped to `pattern="\d{4}\-W((0[1-9])|([1234]\d)|(5[0-3]))"` (i.e.,`yyyy-Www`).

## Contact

#### URL (`<input type="url">`)
`type="string"` and `format="uri"`  (Note the difference.)

#### Email (`<input type="email">`)
`type="string"` and `format="email"`

#### Phone Number (`<input type="tel">`)
`type="string"` and `display.type="tel"` (JSON schema doesn't yet have a built-in format for matching phone numbers).

## Numeric

#### Number (`<input type="number">`)
`type="number"`

#### Slider (`<input type="range">`)
`type="number"` and `display.type="range"`.

#### Attributes
- To set the`min` and `max` attributes on the html element, specify`minimum` and `maximum` in the JSON schema. (There's currently no support for`exclusiveMinimum` and `exclusiveMaximum`)
- To specify a`step` on the html element, specify`multipleOf` in the JSON schema. For this to work, your`minimum` and `maximum` should be multiples of`multipleOf`.
## Choices

#### Radio (`<input type="radio">`)
 Create this indirectly by specifying`enum

#### Checkbox (`<input type="checkbox">`)

#### Search (`<input type="search">`)
- `dirname`

#### Autocomplete

#### Dropdown (`<select>...</select>`)


## Miscellaneous

#### Color (`<input type="color">`)
`type="string"` and `format="color"` // TODO Implement

Note: this is a non-standard format (it's not included in the JSON schema spec).
Behind the scenes, this gets mapped to`pattern="#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"` (a hexadecimal color).

#### File (`<input type="file">`)
 // TODO: Take a look at [this page](https://json-schema.org/understanding-json-schema/reference/non_json_data.html).
  
- `accept`,`capture`

#### Hidden (`<input type="hidden">`)

`display.hidden=true`

#### Submit (`<input type="submit">`)
`type="null"` & `display.type="submit"`


## Custom inputs

#### Toggle switch

#### Likert table

#### Quantity

#### Currency

