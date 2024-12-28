import React, { useState } from 'react';
import styles from './Task.less';
import { Draggable } from 'react-beautiful-dnd';
import { Checkbox, Tag, Card } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import SmallRate from './SmallRate';

const colors = ['#333','#888','#666','#444','#222'];

const Task = ({ columnId, task, index, onTaskChange, onCheckLittleTask, ...restProps }) => {
  // console.log('task.items==>', task);
  // const [collapse, setCollapse] = useState(task.collapse||true);
  const [filter, setFilter] = useState(0);
  const progress = task?.items?.length>0? task?.items?.filter(ite=>ite.checked).length: 0 ;
  const totalLength = task?.items?.length
  const handleCollapse=(e)=>{
    e.stopPropagation();
    // setCollapse(!collapse)
    setFilter(0)
    onTaskChange({collapse: !task.collapse})
  }
  const handleSwitchFilter=(e)=>{
    e.stopPropagation();
    onTaskChange({collapse: false})
    setFilter(filter+1)
  }
  const handleFilterTodo=(todos=[])=>{
    if(progress===totalLength){
      return todos;
    }
    switch(filter%3){
      case 1:
        return todos;
      case 2: 
        return todos.filter(item=>item.checked);
      default:
        return todos.filter(item=>!item.checked);
    }
  }
  const showTodos = handleFilterTodo(task?.items).sort((prev,next)=>(next.level||1) - (prev.level||1))
  // console.log('showTodos===', showTodos)
  return (
    <Draggable
      key={task.id}
      draggableId={task.id}
      index={index}
      // isDragDisabled={isDragDisabled}
    >
      {(provided) => {
        //snapshot.isDragging
        return (
          <Card
            className={styles.taskCard}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            bodyStyle={{ padding: '8px 8px 8px 12px' }}
          >
            <div
              key={task.id}
              className={`context_menu_task ${styles.Task}`}
              // 注意不要覆盖 draggableProps.style
              data-task={JSON.stringify(task)}
              data-columnid={columnId}
              {...restProps}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {/* <div
                  className={`${styles.important_line}`}
                  style={{ width: `${task.rate * 25}%` }}
                />
                <span className={styles.divider} style={{ left: '25%' }} />
                <span className={styles.divider} style={{ left: '50%' }} />
                <span className={styles.divider} style={{ left: '75%' }} /> */}
                <SmallRate count={4} value={task.rate || 0} />
                <div className={styles.content}>{task.content}</div>
                {
                  totalLength>0&&
                  <span className={styles.collapseIcon} onClick={e=>e.stopPropagation()} onDoubleClick={e=>e.stopPropagation()}>
                    <span className={styles.progress} onClick={handleSwitchFilter}>{progress}</span> 
                    <i style={{marginInline:'2px'}}>/</i>
                    <span onClick={handleCollapse}>
                      {totalLength}
                      {
                        task.collapse ? <DownOutlined className="icon"/>: <UpOutlined className="icon"/>
                      }
                    </span>
                  </span>
                }
              </div>
              {
                !task.collapse&&
                <>
                  {/* <div className={styles.tips}>{task.desc}</div> */}
                  {
                    showTodos.length>0&&
                    <div  style={{marginTop: 8}}>
                      {showTodos.map((item, index) => {
                        return (
                          <div key={item.createTime||index} className={styles.smallTitle}>
                            <Checkbox
                              size="small"
                              style={{ marginRight: 6 }}
                              checked={item.checked}
                              onChange={({ target }) =>
                                onCheckLittleTask(item, target.checked, index)
                              }
                            ></Checkbox>
                            <div style={{color: colors[item.level||1]}}>{item.title}</div>
                          </div>
                        );
                      })}
                    </div>
                  }
                  {
                    task?.tags?.length>0&&
                    <div className={styles.tags}>
                    {task?.tags?.map((tag) => {
                      return (
                        <Tag key={tag} size="small" onChange={() => {}}>
                          {tag}
                        </Tag>
                      );
                    })}
                  </div>
                  }
                </>
              }
            </div>
          </Card>
        );
      }}
    </Draggable>
  );
};
export default Task;
