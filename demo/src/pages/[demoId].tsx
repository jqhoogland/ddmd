import type { NextPage } from 'next'
import Head from 'next/head'
import ReactDDMD from "ddmd-react/dist/RemarkDDMD";
import FaviconEmoji from "./components/FaviconEmoji";

const Home: NextPage = () => {
  // const md = useFetchMd();
  // const frontmatter = useFrontmatter(md);

  return (
    <div>
      <Head>
        <title>Data-driven MD</title>
        <meta name="description" content="Data-driven markdown demo." />
        <FaviconEmoji>{"⭐️"}</FaviconEmoji>
      </Head>

      <main className="max-w-screen-md mx-auto prose">
        <h1>
          Datadriven Markdown Example.
        </h1>

        <ReactDDMD>
          {"# Hello"}
        </ReactDDMD>        
      </main>
    </div>
  )
}

export default Home
