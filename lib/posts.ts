import fetch from "node-fetch";

type Post = {
  id: string;
  title: string;
  content: string;
  created_at: Date;
};

//サーバサイドで実行されるコード
export async function getAllPostsData(): Promise<Post[]> {
  const res = await fetch(
    new URL(`${process.env.NEXT_PUBLIC_RESTAPI_URL}api/list-post/`)
  );

  const posts: Post[] = await res.json();
  //ソート（新しい順）
  const filteredPosts: Post[] = posts.sort(
    (a, b) =>
      new Date(b.created_at).valueOf() - new Date(a.created_at).valueOf()
  );
  return filteredPosts;
}

export async function getAllPostIds() {
  const res = await fetch(
    new URL(`${process.env.NEXT_PUBLIC_RESTAPI_URL}api/list-post/`)
  );

  const posts: Post[] = await res.json();

  //postsに含まれるidだけを抽出する
  return posts.map((post) => {
    return {
      params: {
        id: String(post.id),
      },
    };
  });
}

//指定されたIDに基づいて記事を取得する
export async function getPostData(id: string) {
  const res = await fetch(
    new URL(`${process.env.NEXT_PUBLIC_RESTAPI_URL}api/detail-post/${id}`)
  );

  const post: Post = await res.json();
  return {
    post,
  };
}
