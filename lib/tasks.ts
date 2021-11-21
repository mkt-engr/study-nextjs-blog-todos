import fetch from "node-fetch";
import { TASK } from "../Types/taskType";

//サーバサイドで実行されるコード
export async function getAllTasksData(): Promise<TASK[]> {
  const res = await fetch(
    new URL(`${process.env.NEXT_PUBLIC_RESTAPI_URL}api/list-task/`)
  );

  const tasks: TASK[] = await res.json();
  //ソート（新しい順）
  const staticFilteredTasks: TASK[] = tasks.sort(
    (a, b) =>
      new Date(b.created_at).valueOf() - new Date(a.created_at).valueOf()
  );
  return staticFilteredTasks;
}

export async function getAllTaskIds() {
  const res = await fetch(
    new URL(`${process.env.NEXT_PUBLIC_RESTAPI_URL}api/list-task/`)
  );

  const tasks: TASK[] = await res.json();

  //postsに含まれるidだけを抽出する
  return tasks.map((task) => {
    return {
      params: {
        id: String(task.id),
      },
    };
  });
}

//指定されたIDに基づいて記事を取得する
export async function getTaskData(id: string) {
  const res = await fetch(
    new URL(`${process.env.NEXT_PUBLIC_RESTAPI_URL}api/detail-task/${id}`)
  );
  const task: TASK = await res.json();
  return {
    task,
  };
}
