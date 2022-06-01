
const BODY = `
# Hello

This is a body.

---

\`\`\`question
$id: some_name
title: 🥋 Some title...
description: Some description...
type: number

placeholder: My placeholder
code: 123
system: LOINC
---

$id: second_name
title: ☢️ Another title...
description: Another description...
type: number
code: 123
system: LOINC

\`\`\`  

\`\`\`question
$id: some_name
title: 🥋 Some title...
description: Some description...
type: number
code: 123
system: LOINC
---

$id: second_name
title: ☢️ Another title...
description: Another description...
type: number
code: 123
system: LOINC

\`\`\`  



\`\`\`question
$id: radio
title: 🔘 Radio
description: Select one option (and only one!).
enum: 
- title: hello
  value: 1
- title: "what's up"
  value: 2
- title: Another choice
  value: 3

\`\`\`  


\`\`\`question
$id: checkbox
title: ☑️ Checkbox
description: Select as many options as you like.
type: array
items:
  enum: 
  - title: hello
    value: 1
  - title: "what's up"
    value: 2
  - title: Another choice
    value: 3

\`\`\`  


\`\`\`callout 📈
Cum devirginato experimentum, omnes magisteres perdere camerarius, bassus humani generises.
\`\`\`


\`\`\`js
const something = "something";
\`\`\`


HMMM

- a list
  - of elements
  - and more
- and more
- and more...

a *little* **interm**

1. One
2. Two
  1. Three
  2. Four
  
> And a block quote

Cur habitio unda Festus hydras ducunt ad messor. Aususs messis!? \`codeas o125\` Vae, domus! Vae, heuretes!

`

export const data = {
  id: "123",
  title: "Some title",
  icon: "🦀",
  body: BODY
}
