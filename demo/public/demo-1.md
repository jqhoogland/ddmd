---
id: 123
title: Some title
icon: 🦀
banner: "https://www.arrowsrestaurant.com/wp-content/uploads/2020/06/healthy.jpg"
---

# Hello

This is a body.

---

#### Text

```question
$id: q_text
title: 📕 Text (short)
description: Go ahead, write something...
type: string
```  

```question
$id: q_textarea
title: 📚 Text (long)
description: Go ahead, write something longer...
type: string

rows: 5
```  

---

#### Numbers

```question
$id: q_number
title: "💯 Number"
description: Type a number
type: number
---
$id: q_currency
title: "💰️ Currency"
description: Enter an amount (USD)
type: quantity
units: $
---
$id: q_quantity
title: "⚖️ Quantity"
description: Type a quantity (with units)
type: quantity
units: m

```


```question
$id: q_range
title: "⭕️ Range"
description: Choose a number out of a range.
type: range
min: 0
max: 10
step: 1
ticks: true

---
$id: q_range_2
title: "⭕️ Range 2"
description: Choose a number out of a range.
type: range
min: 1
max: 10
step: 1
ticks: [😭, null, 😞, null, 😑, null, 😊, null, 😁]


```



---

#### Choices

```question
$id: q_radio
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
$id: q_checkbox
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

```  

---

```question
$id: q_dropdown_one
title: 🔘 Dropdown (single)
description: Select one option (and only one!).
enum: 
- label: An option group
  enum: 
  - title: hello
    value: 1
  - title: "what's up"
    value: 2
- label: Another option group
  enum:    
  - title: Another choice
    value: 3

variant: dropdown  
---
$id: q_dropdown_multiple
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

variant: dropdown

```  

---

```question
$id: q_autocomplete
title: 🔘 Autocomplete (single)
description: Select one option (and only one!).
enum: 
- title: hello
  value: 1
- title: "what's up"
  value: 2
- title: Another choice
  value: 3

variant: autocomplete  
```  


---

```question
$id: q_button
title: 🔲 Button
description: Push to toggle.
type: boolean
label: Push me 
variant: button

---

$id: q_radio_buttons
title: 🔘 Toggle Buttons
description: Select an option
enum: 
- title: hello
  value: 1
- title: "what's up"
  value: 2
- title: Another choice
  value: 3

variant: button

```  
---

#### Contact

```question
$id: q_telephone
title: 📞 Telephone
description: How can we reach you?
type: tel
---
$id: q_email
title: ✉️ Email
description: How can we reach you?
type: email
---
$id: q_url
title: 🔗 URL
description: Share a url.
type: url
```  

---

#### Times


```question
$id: q_date
title: 📆 Date
description: What date is it today?
type: date
---
$id: q_time
title: ⏰ Time
description: What time is it right now?
type: time
```  


```question
$id: q_date
title: ⏳ Datetime
description: What date and time is it right now?
type: datetime

```  

---

```question
$id: q_file
title: 📁 File
description: Upload a file.
type: file
```  

---


```callout 📈
Cum devirginato experimentum, omnes magisteres perdere camerarius, bassus humani generises.
```


```js
const something = "something";
```


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

Cur habitio unda Festus hydras ducunt ad messor. Aususs messis!? `codeas o125` Vae, domus! Vae, heuretes!
