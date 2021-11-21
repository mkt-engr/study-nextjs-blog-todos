import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { getAllPostIds, getPostData } from "../../lib/posts";

import React from "react";
type Post = {
  id: string;
  title: string;
  content: string;
  created_at: Date;
};
type Props = {
  post: Post;
};
const Post: React.FC<Props> = ({ post }) => {
  const router = useRouter();
  if (router.isFallback || !post) {
    return <div>Loading...</div>;
  }
  return (
    <Layout title={post.title}>
      <p className="m-4">{"ID : "}</p>
      <p className="mb-4 text-xl font-bold">{post.title}</p>
      <p className="mb-12">{post.created_at}</p>
      <p className="px-10">{post.content}</p>
      <Link href="/BlogPage">
        <div className="flex cursor-pointer mt-12">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-3"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          <span>Back to blog page</span>
        </div>
      </Link>
    </Layout>
  );
};

export default Post;

export async function getStaticPaths() {
  const paths = await getAllPostIds();

  return {
    paths,
    fallback: true, //存在していないID（３とか４）にアクセスすると404になる
    //ビルド後にID３、４とかが生成されても404のままになってしまう。
  };
}

export async function getStaticProps({ params }) {
  const { post } = await getPostData(params.id);
  return {
    props: {
      post,
    },
    revalidate: 3, //HTML再生成の時間：３秒
  };
}
