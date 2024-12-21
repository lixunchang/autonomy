import React, { useState, useCallback } from "react";
import moment from "moment";
import styles from "./index.less";
import { IColumn, ITask, EStatus, ERate, ERepeat } from "./initial";
import shortid from "shortid";
import { DragDropContext } from "react-beautiful-dnd";
import Column from "../components/Column";
import { Input, Rate, Form, Button, Menu } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { ITodo } from "./initial";
import AddModal from "./components/AddDrawer";
import useContextMenu from "../hooks/useContextMenu";
import { PlusCircleOutlined } from "@ant-design/icons";

const emptyString = ["undefined", "null", ""];

const switchColumnTask = (todoData, source, destination) => {
  console.log("******", source, destination);
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
    if (destination.droppableId === "column-inprogress") {
      task.inprogressTime = Date.now();
    }
    if (destination.droppableId === "column-done") {
      task.finishTime = Date.now();
    }
    newColumns[targetColumnIndex].tasks.splice(destination.index, 0, task);
  }
  // console.log('xxxnewColumns', newColumns);
  return { ...todoData, columns: newColumns };
};

const deleteColumnTask = (todoData, source) => ({
  ...todoData,
  columns: todoData?.columns?.map((column) => {
    if (column.id === source.droppableId) {
      column.tasks.splice(source.index, 1);
    }
    return {
      ...column,
    };
  }),
});
const getTaskText = (task = {}) => {
  return [
    task.content,
    task.desc,
    task.items.map((item) => item.title).join("-"),
    task.tags.join("-"),
  ].join("-");
};

const sortTaskByRate = (columns, searchFilter) =>
  columns.map((column) => {
    return {
      ...column,
      tasks: column.tasks
        .filter((task) =>
          getTaskText(task).includes(searchFilter[column.id] || ""),
        )
        .sort((a, b) => b.rate - a.rate),
    };
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

const TodoList = React.memo((props) => {
  const { activeFile, onChange } = props;
  // console.log('activeFile==', activeFile, activeFile?.body)
  const columns =
    activeFile?.body?.length > 0 && !emptyString.includes(activeFile.body)
      ? typeof activeFile?.body === "string"
        ? JSON.parse(activeFile.body)
        : activeFile?.body
      : [...defalutColumns];
  const todoData = { ...activeFile, columns };
  // const [taskRate, setTaskRate] = useState(ERate.zero);
  // const [inputTask, setInputTask] = useState('');
  // const [inputTaskDesc, setInputTaskDesc] = useState('');
  const [taskRepeat, setTaskRepeat] = useState(ERepeat.once);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [modalColumnId, setModalColumnId] = useState();
  const [searchFilter, setSearchFilter] = useState({});
  const [sortType, setSortType] = useState("normal");

  // console.log("sortedColumns111", columns);
  const clickItem = useContextMenu(
    [
      {
        label: "编辑",
        click: () => {
          const { current } = clickItem;
          if (current !== null) {
            const task = JSON.parse(current.dataset.task);
            console.log("task==", task);
            setOpen(true);
            setModalColumnId(current.dataset.columnid);
            form.setFieldsValue({
              id: task.id,
              title: task.content,
              desc: task.desc,
              rate: task.rate,
              items: task.items,
              tags: task.tags,
            });
          }
        },
      },
      {
        label: "移至回收站",
        click: () => {
          const { current } = clickItem;
          if (current !== null) {
            const task = JSON.parse(current.dataset.task);
            // console.log(
            //   'xxx===>',
            //   columns.map((column) => {
            //     if (column.id === current.dataset.columnid) {
            //       return {
            //         ...column,
            //         tasks: column.tasks.filter((item) => item.id !== task.id),
            //       };
            //     }
            //     return column;
            //   })
            // );
            handleDeleteTask(current.dataset.columnid, task.id);
          }
        },
      },
    ],
    "context_menu_task",
    [columns],
  );

  const handleDeleteTask = (columnId, taskId) => {
    onChange(
      todoData.id,
      columns.map((column) => {
        debugger;
        if (column.id === columnId) {
          return {
            ...column,
            tasks: column.tasks.filter((item) => item.id !== taskId),
          };
        }
        return column;
      }),
      {},
      true,
    );
  };

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) {
      // const { id, columns } = deleteColumnTask({ ...todoData }, source);
      // onChange(id, columns);
      return;
    }
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }
    const { id, columns } = switchColumnTask(todoData, source, destination);
    onChange(id, columns, {}, true);
  };
  const handleTaskEdit = (column, task) => {
    setOpen(true);
    setModalColumnId(column.id);
    form.setFieldsValue({ ...task, title: task.content });
  };

  // const rate = (
  //   <Rate
  //     allowClear={false}
  //     value={taskRate}
  //     defaultValue={ERate.zero}
  //     count={4}
  //     tooltips={[
  //       '不紧急不重要',
  //       '不紧急很重要',
  //       '很紧急不重要',
  //       '很紧急很重要',
  //     ]}
  //     style={{ fontSize: 14, color: 'orangered' }}
  //     onChange={setTaskRate}
  //   />
  // );
  const handleAddTodo = (values) => {
    const { id, title, desc, rate, items = [], tags = [] } = values;
    if (!title) {
      return;
    }
    const newTodo = {
      id: id || shortid.generate(),
      status: EStatus.todo,
      content: title,
      desc: desc,
      rate: rate,
      repeat: taskRepeat,
      items,
      tags,
      createTime: Date.now(),
    };
    onChange(
      todoData.id,
      columns.map((column) => {
        if (column.id === modalColumnId) {
          return {
            ...column,
            tasks: id
              ? column.tasks.map((task) => {
                  if (task.id === id) {
                    return {
                      ...task,
                      ...newTodo,
                      createTime: task.createTime || Date.now(),
                    };
                  }
                  return task;
                })
              : [newTodo, ...column.tasks],
          };
        }
        return column;
      }),
      {},
      true,
    );
    // setInputTask('');
    // setInputTaskDesc('');
    // setTaskRate(ERate.zero);
  };
  const handleTaskChange = (columnItem, newTask) => {
    onChange(
      todoData.id,
      columns.map((column) => {
        if (column.id === columnItem.id) {
          return {
            ...column,
            tasks: column.tasks.map((task) => {
              if (task.id === newTask.id) {
                return {
                  ...task,
                  ...newTask,
                };
              }
              return task;
            }),
          };
        }
        return column;
      }),
      {},
      true,
    );
  };
  const handleCheckLittleTask = (
    columnItem,
    taskItem,
    little,
    checked,
    index,
  ) => {
    onChange(
      todoData.id,
      columns.map((column) => {
        if (column.id === columnItem.id) {
          return {
            ...column,
            tasks: column.tasks.map((task) => {
              if (task.id === taskItem.id) {
                return {
                  ...task,
                  items: task.items.map((item) => {
                    if (item.title === little.title) {
                      return {
                        ...item,
                        checked,
                        finishTime: checked ? Date.now() : 0,
                      };
                    }
                    return item;
                  }),
                };
              }
              return task;
            }),
          };
        }
        return column;
      }),
      {},
      true,
    );
  };
  // console.log('todo==', todoData, columns);
  const sortedColumns =
    sortType === "rate" ? sortTaskByRate(columns, searchFilter) : columns;
  // console.log("sortedColumns", sortedColumns, columns, searchFilter);
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {/* <div className={styles.title}>象限法则日程</div> */}
      <div className={styles.Todo}>
        <div className={styles.columns}>
          {sortedColumns.map((column, index) => {
            return (
              <Column
                key={column.id}
                column={column}
                onEditTask={handleTaskEdit}
                handleTaskChange={handleTaskChange}
                onCheckLittleTask={handleCheckLittleTask}
                actions={
                  <>
                    <Input
                      placeholder={""}
                      bordered={false}
                      suffix={<SearchOutlined />}
                      className={styles.search}
                      onChange={(e) =>
                        setSearchFilter({
                          ...searchFilter,
                          [column.id]: e.target.value,
                        })
                      }
                    />
                    <PlusCircleOutlined
                      className={styles.add}
                      onClick={() => {
                        setOpen(true);
                        setModalColumnId(column.id);
                      }}
                    />
                  </>
                }
              />
            );
          })}
        </div>
        {open && (
          <AddModal
            form={form}
            open={open}
            closeModal={() => {
              setOpen(false);
            }}
            handleAddTodo={handleAddTodo}
          />
        )}
      </div>
    </DragDropContext>
  );
});

export default TodoList;
