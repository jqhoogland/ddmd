import type { GetServerSidePropsContext, GetStaticPaths, GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import ReactDDMD from "ddmd-react/dist/RemarkDDMD";
import FaviconEmoji from "./components/FaviconEmoji";
import ReactMarkdown from "react-markdown";
import fs from 'fs'
import path from 'path'
import remarkFrontmatter from "remark-frontmatter"
import { getPageData } from "./components/utils/md";

const Home: NextPage<{children: string}> = ({ children }) => {
  const {title, icon, banner="", body} = getPageData(children);

  return (
    <div>
      <Head>
        <title>{`${title} | DDMD`}</title>
        <meta name="description" content="Data-driven markdown demo." />
        <FaviconEmoji>{icon}</FaviconEmoji>
      </Head>

      {
        banner && (
          <img src={banner} className="w-full max-h-[30vh] object-cover" alt="hello"/>
        )
      }
      <main className="max-w-screen-md mx-auto prose pt-16 pb-32">
        <h1 className="text-[5rem]">{icon}</h1>
        <h1 className="text-5xl">{title}</h1>
        <ReactMarkdown
          remarkPlugins={[remarkFrontmatter]}
        >
          {body}
        </ReactMarkdown>        
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