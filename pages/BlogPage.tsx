import React, { ReactNode } from "react";
import Layout from "../components/Layout";
import Link from "next/link";
import { getAllPostsData } from "../lib/posts";
import Post from "../components/Post";

type POST = {
  id: string;
  title: string;
  content: string;
  created_at: Date;
};
type Props = {
  filteredPosts: POST[];
};

const BlogPage: React.FC<Props> = ({ filteredPosts }) => {
  return (
    <Layout title="Blog page">
      <ul>
        {filteredPosts &&
          filteredPosts.map((post: Post) => (
            <Post key={post.id} post={post}></Post>
          ))}
      </ul>

      <Link href="/MainPage">
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
          <span>Back to main page</span>
        </div>
      </Link>
    </Layout>
  );
};

export default BlogPage;

type StaticProps = {
  props: {
    filteredPosts: POST[];
  };
};
//ビルド時に呼び出されてサーバで呼び出される
export async function getStaticProps() {
  const filteredPosts = await getAllPostsData();
  return {
    props: { filteredPosts },
    revalidate: 3, //HTML
  };
}
