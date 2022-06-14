import type { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import FaviconEmoji from "./components/FaviconEmoji";
import fs from 'fs'
import path from 'path'
import remarkFrontmatter from "remark-frontmatter"
import { getPageData } from "./components/utils/md";
import Image from "next/image";
// import dynamic from "next/dynamic";
import React from "react";
import {RemarkDDMD} from "ddmd-react";


// const RemarkDDMD = dynamic(() => import("ddmd-react/dist/esm/dist/RemarkDDMD"), {ssr: false});

const Home: NextPage<{children: string}> = ({ children }) => {
  const {title, icon, banner="", body} = getPageData(children);
  
  const handleChange = ({state, schema}) => {
    console.log(state);
  }

  return (
    <div>
      <Head>
        <title>{`${title} | DDMD`}</title>
        <meta name="description" content="Data-driven markdown demo." />
        <FaviconEmoji>{icon}</FaviconEmoji>
      </Head>

      {
        banner && (
          <div className="w-full h-[30vh] relative">
            <Image 
              src={banner} 
              layout="fill"
              alt="hello"
              objectFit="cover"
            />
          </div>
        )
      }
      <main className="max-w-screen-md mx-auto prose pt-16 pb-32 px-4">
        <div className="flex gap-8 items-baseline pb-4">
          <h1 className="text-6xl mb-0">{icon}</h1>
          <h1 className="text-4xl mb-0">{title}</h1>
        </div>
        {body && <RemarkDDMD
          remarkPlugins={[remarkFrontmatter]}
          onChange={handleChange}
        >
          {body}
        </RemarkDDMD>}        
      </main>
    </div>
  )
}

export default Home


export const getStaticProps: GetStaticProps = async (context) => {
  const dataPath = path.join(process.cwd(), `/public/${context.params!.demoId}.md`);
  const data = fs.readFileSync(dataPath).toString();

  return {
    props: {children: data}
  }
}

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [
      {params: {demoId: "demo-1"}},
      {params: {demoId: "demo-2"}}
    ],
    fallback: false 
  }
}