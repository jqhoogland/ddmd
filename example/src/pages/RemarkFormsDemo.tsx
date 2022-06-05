import {useMdRouter} from "../hooks/router";
import React, { ReactNode } from "react";
import {setFavicon, setTitle} from "../utils/dom";
import {Box, CardHeader, Container, Divider, Typography} from "@mui/material";
import DataDrivenMD from "../components/DataDrivenMD";


const RemarkFormsDemo = () => {
    const {icon, title, banner, body} = useMdRouter();
    const hasBanner = !!banner;

    /** Gross. This mixes reactive and non-reactive code.
     * Then again, this is a demo, so... whatever. */
    React.useEffect(() => {
        setFavicon(icon);
        setTitle(title);
    }, [icon, title]);

    return (
        <>
            {hasBanner && (
                <Box sx={{
                    width: "100vw",
                    position: "relative",
                    left: 0,
                    overflowY: "hidden",
                    zIndex: -100,
                    img: {
                        width: "100%",
                        maxHeight: "25vh",
                        objectFit: "cover",
                        objectPosition: "center",
                    }
                }}>
                    <img src={banner} alt={"banner"}/>
                </Box>
            )}
            <Container maxWidth={"sm"}>
                <main>
                    <CardHeader
                        avatar={
                            <Typography variant={"h2"} sx={{zIndex: 100}}>{icon}</Typography>
                        }
                        title={
                            <Typography variant="h4" sx={{fontWeight: "600"}}>{title}</Typography>
                        }
                    />
                    <Divider sx={{my: 3}}/>
                    <DataDrivenMD>
                        {body}
                    </DataDrivenMD>
                </main>
            </Container>
        </>
    )
}
export default RemarkFormsDemo;