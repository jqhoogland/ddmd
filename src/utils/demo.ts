
const BODY = `
# Hello

This is a body.

---

#### Text

\`\`\`question
$id: text
title: 📕 Text (short)
description: Go ahead, write something...
type: text
\`\`\`  

\`\`\`question
$id: textarea
title: 📚 Text (long)
description: Go ahead, write something longer...
type: text
\`\`\`  

---

#### Numbers

\`\`\`question
$id: number
title: "💯 Number"
description: Type a number
type: number
---
$id: quantity
title: "⚖️ Quantity"
description: Type a quantity (with units)
type: quantity

\`\`\`


\`\`\`question
$id: range
title: "⭕️ Range"
description: Choose a number out of a range.
type: range
---
$id: quantity
title: "🏔 Double range."
description: Choose two numbers out of a range.
type: range

\`\`\`



---

#### Choices

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
---
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

---

\`\`\`question
$id: radio
title: 🔘 Dropdown (single)
description: Select one option (and only one!).
enum: 
- title: hello
  value: 1
- title: "what's up"
  value: 2
- title: Another choice
  value: 3
---
$id: checkbox
title: ☑️ Dropdown (multiple)
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

---

\`\`\`question
$id: button
title: 🔲 Button
description: Push to toggle.
type: boolean
label: Push me 

\`\`\`  
---

#### Contact

\`\`\`question
$id: telephone
title: 📞 Telephone
description: How can we reach you?
type: tel
---
$id: email
title: ✉️ Email
description: How can we reach you?
type: email
---
$id: url
title: 🔗 URL
description: Share a url.
type: url
\`\`\`  

---

#### Times


\`\`\`question
$id: date
title: 📆 Date
description: What date is it today?
type: date
---
$id: time
title: ⏰ Time
description: What time is it right now?
type: time
\`\`\`  


\`\`\`question
$id: date
title: ⏳ Datetime
description: What date and time is it right now?
type: datetime
---
$id: duration
title: ⌛️ Duration
description: How much time has passed?
type: duration


\`\`\`  

---

\`\`\`question
$id: file
title: 📁 File
description: Upload a file.
type: file
\`\`\`  

---


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
