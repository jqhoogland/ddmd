import { Avatar, Box, CardHeader, Container, Typography } from "@mui/material";
import React from "react";
import {mdSx, parseMDToHTML} from "../utils/md";
import { data } from "../utils/mock";

const MD = ({ body }: { body: string }) => {
  const [bodyProcessed, setBodyProcessed] = React.useState<any>();

  React.useEffect(() => {
      parseMDToHTML(body)
        .then(setBodyProcessed)
    }, [body]
  )
  return (
      <Box sx={mdSx}>
        <div dangerouslySetInnerHTML={{ __html: bodyProcessed }}/>
      </Box>
  )
}

const Notionish = () => {
  return (
    <Container maxWidth={"md"}>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@exampledev/new.css@1.1.2/new.min.css"/>
        <link rel="icon"
              href={`data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${data.icon}</text></svg>`}/>
        <title>{data.title}</title>
      </head>
      <CardHeader
        avatar={<Avatar>{data.icon}</Avatar>}
        header={<Typography variant={"h6"}>{data.title}</Typography>}
      />
      <MD body={data.body}/>
    </Container>
  )
}

export default Notionish
