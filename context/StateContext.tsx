import React, { createContext, useState, ReactNode } from "react";
import { TASK } from "../Types/taskType";

export const StateContext = createContext(null);

type Props = {
  children: ReactNode;
};

const StateContextProvider: React.FC<Props> = (props) => {
  const [selectedTask, setSelectedTask] = useState({
    id: 0,
    title: "",
  });
  return (
    <StateContext.Provider value={{ selectedTask, setSelectedTask }}>
      {props.children}
    </StateContext.Provider>
  );
};

export default StateContextProvider;
