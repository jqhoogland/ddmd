import fs from 'node:fs';
import path from 'node:path';
import Head from 'next/head';
import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import remarkFrontmatter from 'remark-frontmatter';
import Image from 'next/image';
import React from 'react';
import dynamic from 'next/dynamic';
import FaviconEmoji from '../components/FaviconEmoji';
import { getPageData } from '../components/utils/md';

const RemarkDDMD = dynamic(async () => import('@ddmd/react/src/RemarkDDMD'), {
  ssr: false
});

const MemoizedForm: typeof RemarkDDMD = React.memo(RemarkDDMD);

const Home: NextPage<{ children: string }> = ({ children }) => {
  const { title, icon, banner = '', body } = getPageData(children);
  const [state, setState] = React.useState({});
  const [schema, setSchema] = React.useState({});

  const handleChange = React.useCallback(
    ({
      state: { $schema, ...state }
    }: {
      state: { $schema: any; [key: string]: any };
    }) => {
      setState(state);
      if (!$schema) {
        setSchema($schema);
      }
    },
    []
  );

  return (
    <div>
      <Head>
        <title>{`${title} | DDMD`}</title>
        <meta name="description" content="Data-driven markdown demo." />
        <FaviconEmoji>{icon}</FaviconEmoji>
      </Head>

      {banner && (
        <div className="w-full h-[30vh] relative">
          <Image src={banner} layout="fill" alt="hello" objectFit="cover" />
        </div>
      )}
      <main className="max-w-screen-md mx-auto prose pt-16 pb-32 px-4">
        <div className="flex gap-8 items-baseline pb-4">
          <h1 className="text-6xl mb-0">{icon}</h1>
          <h1 className="text-4xl mb-0">{title}</h1>
        </div>

        <h2>Current State</h2>
        <p>Scroll down for the schema</p>
        <pre>
          <code lang="json">{JSON.stringify(state, null, 2)}</code>
        </pre>

        {body && (
          <MemoizedForm
            remarkPlugins={[remarkFrontmatter]}
            // @ts-expect-error
            onChange={handleChange}
          >
            {body}
          </MemoizedForm>
        )}

        <pre>
          <code lang="json">{JSON.stringify(schema, null, 2)}</code>
        </pre>
      </main>
    </div>
  );
};

export default Home;



export const getStaticProps: GetStaticProps = async (context) => {
  const dataPath = path.join(
    process.cwd(),
    `/public/${context.params!.demoId}.md`
  );
  const data = fs.readFileSync(dataPath).toString();

  return {
    props: { children: data }
  };
};

export const getStaticPaths: GetStaticPaths = () => ({
  paths: [{ params: { demoId: 'demo-1' } }, { params: { demoId: 'demo-2' } }],
  fallback: false
});
