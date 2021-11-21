import React, { TableHTMLAttributes, useContext } from "react";
import { StateContext } from "../context/StateContext";
import Cookie from "universal-cookie";
import { TASK } from "../Types/taskType";
import { KeyedMutator } from "swr";

const cookie = new Cookie();

type Props = {
  taskCreated: KeyedMutator<TASK[]>;
};
const TaskForm: React.FC<Props> = ({ taskCreated }) => {
  const { selectedTask, setSelectedTask } = useContext(StateContext);

  const create = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await fetch(`${process.env.NEXT_PUBLIC_RESTAPI_URL}api/tasks/`, {
      method: "POST",
      body: JSON.stringify({ title: selectedTask.title }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${cookie.get("access_token")}`,
      },
    }).then((res) => {
      if (res.status === 401) {
        alert("JWT Token not valid");
      }
    });
    //タスクの初期化
    setSelectedTask({ id: 0, title: "" });
    taskCreated(); //mutateの実行
  };

  const update = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await fetch(
      `${process.env.NEXT_PUBLIC_RESTAPI_URL}api/tasks/${selectedTask.id}`,
      {
        method: "PUT",
        body: JSON.stringify({ title: selectedTask.title }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${cookie.get("access_token")}`,
        },
      }
    ).then((res) => {
      if (res.status === 401) {
        alert("JWT Token not valid");
      }
    });
    //タスクの初期化
    setSelectedTask({ id: 0, title: "" });
    taskCreated(); //mutateの実行
  };
  return (
    <div>
      <form onSubmit={selectedTask.id !== 0 ? update : create}>
        <input
          type="text"
          className="text-black mb-8 px-2 py-1"
          value={selectedTask.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSelectedTask((prev: TASK) => {
              return { ...prev, title: e.target.value };
            });
          }}
        />
        <button
          type="submit"
          className="bg-gray-500 ml-2 hover:bg-gray-600 text-sm px-2 py-1 rounded uppercase"
        >
          {selectedTask.id !== 0 ? "update" : "create"}
        </button>
      </form>
    </div>
  );
};
export default TaskForm;
