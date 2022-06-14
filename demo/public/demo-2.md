---
id: 123
title: Life landscape
icon: 🏔
banner: "/benjamin-voros-phIFdC6lA4E-unsplash.jpg"
---

--- ### Fieldset 1

```question
$id: example_likert
title: "🚦 How are you feeling about...?"
description: "Reflect on how you're feeling across the major dimensions of your life."    
type: array
$defs:
  choices:  
    enum:
    - title: "😬"
      description: Awful
      const: 1
    - title: "😕"
      description: Bad
      const: 2
    - title: "😑"
      description: Neutral
      const: 3
    - title: "😊"
      description: Good
      const: 4
    - title: "😁"
      description: Great
      const: 5
items: 
- $id: sleep
  title: 🛌 Sleep
  $ref: #/$defs/choices
- $id: movement
  title: 🏃 Movement
  $ref: #/$defs/choices
- $id: medical
  title: 🩺 Medical
  $ref: #/$defs/choices 
- $id: stress
  title: 😓 Stress Management
  $ref: #/$defs/choices 
- $id: nutrition
  title: 🍴 Nutrition
  $ref: #/$defs/choices 
- $id: home
  title: 🏡 Home Life 
  $ref: #/$defs/choices 
- $id: social
  title: 🫂 Social Life
  $ref: #/$defs/choices 
- $id: recreation
  title: ⚽️ Recreation 
  $ref: #/$defs/choices 
- $id: work
  title: 💼 Work Life
  $ref: #/$defs/choices 
- $id: spirituality
  title: 🙏 Spirituality
  $ref: #/$defs/choices 
 
variant: button 

```

--- /


--- ### Fieldset 2

```plotly
$id: example_graph
$deps: 
  "data[0].r": "=example_likert[].value"
  "data[0].theta": "=$schema.properties.example_likert.items[].title"
data:
- type: 'scatterpolar'
  r: []
  theta: []
  fill: 'toself'
  
layout:
  title: "My Landscape"
  polar:
    radialaxis:
      visible: true
      range: [0, 5]
  showlegend: false
```

--- /

--- ### Fieldset 3

```question
title: 💭 Time to reflect.
description: What's making you feel this way?
type: string
rows: 5
```

--- /

