## Auth Component UI

ログイン画面のフォームを作る。
https://tailwindui.com/components/application-ui/forms/sign-in-forms

ここにあるものを`components/Auth.tsx`にコピペする。

以下の import が必要

```sh
npm install @tailwindcss/forms
npm install @heroicons/react
```

- tailwind.config.js に書く

```js
// tailwind.config.js
module.exports = {
  // ...
  plugins: [
    // ...
    require("@tailwindcss/forms"),
  ],
};
```

## Auth Component (Function)

.env ファイルで`NEXT_PUBLIC_＜好きなもの＞`を入れると`process.env`で呼び出せる

クッキーを使うので以下のライブラリをインストール

```sh
npm i universal-cookie
```

NEXT から推奨されているライブラリ

```
npm i swr
```

## 日付のソート

参考：https://stackoverflow.com/questions/36560806/the-left-hand-side-of-an-arithmetic-operation-must-be-of-type-any-number-or
`valueOf()`が必要らしい。`.valueOf`がないと Date 型になり引き算ができない。

```ts
const filteredPosts = posts.sort(
  (a, b) => new Date(b.created_at).valueOf() - new Date(a.created_at).valueOf()
);
```

## ISR(Incremental Static Regenerations)

getStaticPaths()→getStaticProps の順番になるかな

まずは　 SSG から。

- `getStaticPaths`の中の`fallback`に関して
  - `fallback:false`の場合：存在していない ID（３とか４）にアクセスすると 404 になる
  - ビルド後に ID ３、４とかが生成されても 404 のままになってしまう。

```tsx
return {
  paths,
  fallback: false,
};
```

`fallback:true`にすることで SSG ができる。

ビルド時(npm run build)には id=1,2 の記事しかない場合を考える。

1. npm start で実行する(.next/server/pages/posts の中には 1.html と 2.html しかない状態)
2. id=3 の記事をアップする(heroku で記事追加)
3. `post/3`にアクセスする
4. 一瞬 Loading 画面が出る

   - [id].tsx

   ```tsx
   if (router.isFallback || !post) {
     return <div>Loading...</div>;
   }
   ```

5. **..next/server/pages/posts の中に 3.html が追加される！！！**(SSG,すげえ)

しかし heroku でコンテンツを更新しても Next の 3.html は更新されない。。

更新されるタメには ISR が必要

## ISR を有効化する

誰かが更新されたページにアクセスして３秒後に再生成される。もしコンテンツ更新後１年間アクセスされなかった場合は１年後に最初にアクセスした人には古い情報が表示される。その次にアクセスした人は最新のコンテンツが表示される。

よって ISR はアクセス頻度が高いものに適している。

ISR を有効化するには以下の`getStaticProps`に以下の return に`revalidate`を追加する。`revalidate:3`は１度 HTML を再生成したとき３秒間は HTML を再生成しないという意味

- [id].tsx

```tsx
export async function getStaticProps({ params }) {
  const { post } = await getPostData(params.id);
  return {
    props: {
      post,
    },
    revalidate: 3, //HTML再生成の時間：３秒
  };
}
```

- BlogPage.tsx

```tsx
//ビルド時に呼び出されてサーバで呼び出される
export async function getStaticProps() {
  const filteredPosts = await getAllPostsData();
  return {
    props: { filteredPosts },
    revalidate: 3, //HTML
  };
}
```

## SWR

SWR のドキュメント：https://swr.vercel.app/docs/with-nextjs

### SSG + Pre-fetch(getStaticProps) + Client Side Fetching(SWR)

Client Side Fetching :

SWR の型のつけ方：https://github.com/vercel/swr/discussions/939

```tsx
import useSWR from "swr";

export const useFeed = () => {
  const { data } = useSWR<YourDataType, YourErrorType>("/api/feed", fetcher);

  return { data };
};
```

- TaskPage.tsx

build 時にはなかった記事を fetcher で DB から取得する。例えば

- build 時：記事 3 つ

```
3. 記事３
2. 記事２
1. 記事１
```

- DB：記事 4 つ

```
4. NEW 記事
3. 記事３
2. 記事２
1. 記事１
```

みたいな場合だと一瞬 3 件分表示されてその後 fetcher で 4 件目を取得し再表示する。
これってユーザーからするとちょっと違和感ある。

よって`getStaticProps`で`revalidate`を設定して 4 件目を取得した時に HTML を再生成する。

```tsx
const fetcher = (url: string): Promise<any> =>
  fetch(url).then((res) => res.json());

const TaskPage: React.FC<Props> = ({ staticFilteredTasks }) => {
  //mutateはキャッシュの最新化に使う
  //初めに表示される時はfallbackDataが使われる
  //その次に非同期でfetcherを用いて最新のデータを取得する(Client Side Fetching)
  const { data: tasks, mutate } = useSWR<TASK[]>(apiUrl, fetcher, {
    fallbackData: staticFilteredTasks,
  });
  //Taskのソート
  const filteredTasks = tasks.sort(
    (a, b) =>
      new Date(b.created_at).valueOf() - new Date(a.created_at).valueOf()
  );
  // const filteredTasks = tasks;
  useEffect(() => {
    //SWRで取得するデータを最新化する
    mutate();
  }, []);

  return (
    <ul>
      {filteredTasks &&
        filteredTasks.map((task) => <Task key={task.id} task={task} />)}
    </ul>
  );
};
```

### mutate とは？

ドキュメント：https://swr.vercel.app/ja/docs/mutation
`mutate`:データを最新化するものっぽい。

「バウンドミューテート」のところを見るに`useSWR`の返り値の`mutate`には URL の指定は必要ないみたい。なので今回の例だと

```tsx
mutate();
```

で済んでいる。しかし POST で API 通信したい場合はそのデータを書く必要がある。ドキュメントで「キーは必要ありません」とあるのは「URL は必要ありません」ってことのような気がする

```tsx
const { data, mutate } = useSWR("/api/user", fetcher);
//  ~~いろいろ省略
mutate({ ...data, name: newName });
```

## Dynamic routes (useSWR + ISR + SSG)

## タスクの削除

- Task.tsx

```tsx
const Task: React.FC<Props> = ({ task, taskDeleted }) => {
  const deleteTask = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_RESTAPI_URL}api/tasks/${task.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${cookie.get("access_token")}`,
      },
    }).then((res) => {
      if (res.status === 401) {
        alert("JWT Token not valid");
      }
    });
    taskDeleted(); //キャッシュデータの最新化:mutate()をpropsで渡してきた。
  };
};
```

- TaskPage.tsx

`mutate`を Task コンポーネントに渡す

```tsx
<ul>
  {filteredTasks &&
    filteredTasks.map((task) => (
      <Task key={task.id} task={task} taskDeleted={mutate} />
    ))}
</ul>
```

## タスクの作成&アップデート

- Context を使う(Redux の React 純正バージョン)

### useContext

参考：https://www.to-r.net/media/react-tutorial-hooks-usecontext/

- context/StateContext.tsx
  - このファイルでグローバルに扱いたい値とそのセッターを書く。今回は選択された
    タスクをグローバルに扱う。
  - `<StateContext.Provider>`の`value`に管理したい値を書く
  - グローバルに扱いたい範囲を`<StateContext.Provider>`で囲う

```tsx
import React, { createContext, useState, ReactNode } from "react";
export const StateContext = createContext(null);

const StateContextProvider: React.FC<Props> = (props) => {
  const [selectedTask, setSelectedTask] = useState({
    id: 0,
    title: "",
  });
  return (
    //createContextで作成したStateContextのProviderを用いる
    <StateContext.Provider value={{ selectedTask, setSelectedTask }}>
      {props.children}
    </StateContext.Provider>
  );
};
```

今回は TaskPage.tsx で値をグローバルに扱いたい。<StateContentProvider>で return 値を囲う。

- TaskPage.tsx

```tsx
<StateContextProvider>
  <Layout title="Task page">
    <TaskForm taskCreated={mutate} />
    <ul>
      {filteredTasks &&
        filteredTasks.map((task) => (
          <Task key={task.id} task={task} taskDeleted={mutate} />
        ))}
    </ul>
    <Link href="/MainPage">
      <div className="flex cursor-pointer mt-12"></div>
    </Link>
  </Layout>
</StateContextProvider>
```

- Task.tsx
  StateContext.tsx で作成したグローバルな値やセッターを呼び出す。

```tsx
import { StateContext } from "../context/StateContext";
type Props = {
  task: TASK;
  taskDeleted: KeyedMutator<TASK[]>;
};
const Task: React.FC<Props> = ({ task, taskDeleted }) => {
  //StateContext.tsxでオブジェクトで定義したから分割代入でsetSelectedTaskだけ受け取る
  //<StateContext.Provider value={{ selectedTask, setSelectedTask }}>
  const { setSelectedTask } = useContext(StateContext);
};
```

とりあえず今は`mutate()`は「キャッシュの最新化」と思っておこう。

### StateContextProvider の型(StateContext.tsx)

```tsx
type Props = {
  children: ReactNode;
};
const StateContextProvider: React.FC<Props> = (props) => {};
```

### form の onSubmit の event の型

参考：https://zenn.dev/fagai/scraps/39800f747d0423
`e:React.FormEvent<HTMLFormElement>`
