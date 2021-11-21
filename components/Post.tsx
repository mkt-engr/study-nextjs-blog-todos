import Link from "next/link";
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
  return (
    <div>
      <span>{post.id}</span>
      {" : "}
      <Link href={`/posts/${post.id}`}>
        <span className="cursor-pointer text-white border-b border-gray-500 hover:bg-gray-600">
          {post.title}
        </span>
      </Link>
    </div>
  );
};

export default Post;
