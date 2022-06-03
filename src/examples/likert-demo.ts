
const BODY = `
### Let's take a step back.

\`\`\`question
$id: example_likert
title: "How are you feeling about...?"
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

\`\`\`

`

export const data = {
  id: "123",
  title: "Life landscape",
  icon: "🏔",
  banner: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.amateurphotographer.co.uk%2Fwp-content%2Fuploads%2F2020%2F09%2FMAIN-Moonrise-over-Blea-Tarn-and-the-Langdales-scaled.jpg&f=1&nofb=1",
  body: BODY
}
