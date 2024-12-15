import React, { useState } from "react";
import moment from "moment";
import styles from "./index.less";
import { IColumn, ITask, EStatus, ERate, ERepeat } from "./initial";
import shortid from "shortid";
import { DragDropContext } from "react-beautiful-dnd";
import Column from "../components/Column";
import { Input, Rate, Dropdown, Button, Menu } from "antd";
import { ITodo } from "./initial";

const switchColumnTask = (todoData, source, destination) => {
  const { columns } = todoData;
  let task;
  let targetColumnIndex;
  const newColumns = columns.map((column, index) => {
    if (column.id === source.droppableId) {
      task = column.tasks[source.index];
      column.tasks.splice(source.index, 1);
    }
    if (column.id === destination.droppableId) {
      targetColumnIndex = index;
    }
    return column;
  });
  if ((targetColumnIndex || targetColumnIndex === 0) && task) {
    newColumns[targetColumnIndex].tasks.splice(destination.index, 0, task);
  }
  return { ...todoData, columns: newColumns };
};

const deleteColumnTask = (todoData, source) => ({
  ...todoData,
  columns: todoData.columns.map((column) => {
    if (column.id === source.droppableId) {
      column.tasks.splice(source.index, 1);
    }
    return {
      ...column,
    };
  }),
});

const sortTaskByRate = (columns) =>
  columns.map((column) => {
    column.tasks.sort((a, b) => b.rate - a.rate);
    return column;
  });

const defalutColumns = [
  {
    id: "column-todo",
    name: "待办",
    tasks: [],
  },
  {
    id: "column-inprogress",
    name: "进行中",
    tasks: [],
  },
  {
    id: "column-done",
    name: "已完成",
    tasks: [],
  },
];

const TodoList = (props) => {
  const { todoData, onChange } = props;
  const { columns = defalutColumns } = todoData;
  const [taskRate, setTaskRate] = useState(ERate.zero);
  const [inputTask, setInputTask] = useState("");
  const [taskRepeat, setTaskRepeat] = useState(ERepeat.once);

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) {
      const newTodoData = deleteColumnTask({ ...todoData }, source);
      onChange(newTodoData);
      return;
    }
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }
    const newTodoData = switchColumnTask(todoData, source, destination);
    onChange(newTodoData);
  };
  const rate = (
    <Rate
      allowClear={false}
      value={taskRate}
      defaultValue={ERate.zero}
      count={4}
      tooltips={[
        "（低）不紧急且不重要",
        "（中）不重要但紧急",
        "（高）重要不紧急",
        "（急）重要且紧急",
      ]}
      style={{ fontSize: 14 }}
      onChange={setTaskRate}
    />
  );
  const handleAddTask = (value) => {
    if (!inputTask) {
      return;
    }
    columns[0].tasks.unshift({
      id: shortid.generate(),
      status: EStatus.todo,
      content: inputTask,
      rate: taskRate,
      repeat: taskRepeat,
    });
    onChange({ ...todoData, columns });
    setInputTask("");
    setTaskRate(ERate.zero);
  };

  const sortedColumns = sortTaskByRate(columns);
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {/* <div className={styles.title}>象限法则日程</div> */}
      <Input.Search
        value={inputTask}
        className={styles.inputSearch}
        placeholder="添加待办事项，记得打上紧急重要分哦～"
        enterButton={
          <Button type="primary" style={{ width: 80, background: "#6E6E6E" }}>
            添加
          </Button>
        }
        onChange={(e) => setInputTask(e.target.value)}
        style={{
          display: "block",
          width: "46%",
          margin: "0 auto 12px",
          marginTop: 30,
        }}
        size="middle"
        suffix={rate}
        onSearch={handleAddTask}
      />
      <div className={styles.columns}>
        {sortedColumns.map((column) => {
          return <Column key={column.id} column={column} />;
        })}
      </div>
    </DragDropContext>
  );
};

export default TodoList;
