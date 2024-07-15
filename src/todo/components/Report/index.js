import React, { useState } from 'react';
import { Button, Drawer } from 'antd';
import moment from 'moment';
import styles from './index.less';


const REPORT_TYPE={
  'week': '周报'
}

const inCycle=(time, cycleType = 'week', backCount = 0)=>{
  if(!time){
    return false;
  }
  const targetTime = moment().subtract(backCount, cycleType);
  return moment(time).isBetween(targetTime.startOf(cycleType).valueOf(), targetTime.endOf(cycleType).valueOf()) 
}

const Report = ({ type = 'week', activeFile, closeReport }) => {

  const [backCount, setBackCount] = useState(0)

  const activeContent =  JSON.parse(activeFile.body||'[]')

  const { newTodo=[], newInprogress=[], newFinish=[] } = activeContent.reduce((total, item)=>{
    const {newTodo=[], newInprogress=[], newFinish=[]} = item.tasks.reduce((total,ite)=>{
      const newTd=[], newIP=[], newFI=[];
      if(inCycle(ite.createTime, type, backCount)){
        newTd.push(ite);
      }else{
        const inCycleItems = ite.items?.filter(it=>inCycle(it.createTime, type, backCount));
        if(inCycleItems?.length > 0){
          newTd.push({
            ...ite,
            items: inCycleItems
          })
        }
      }
      if(inCycle(ite.inprogressTime, type, backCount)){
        newIP.push(ite);
      }
      if(inCycle(ite.finishTime, type, backCount)){
        newFI.push(ite);
      }else{
        const inCycleItems = ite.items?.filter(it=>inCycle(it.finishTime, type, backCount));
        if(inCycleItems?.length > 0){
          newFI.push({
            ...ite,
            items: inCycleItems
          })
        }
      }
      return {
        newTodo: [...total.newTodo, ...newTd],
        newInprogress: [...total.newInprogress, ...newIP],
        newFinish: [...total.newFinish, ...newFI]
      }
    }, {newTodo:[],newInprogress:[],newFinish:[]});
    return {
      newTodo: [...total.newTodo,...newTodo],
      newInprogress: [...total.newInprogress,...newInprogress],
      newFinish: [...total.newFinish,...newFinish]
    }
  }, {newTodo:[],newInprogress:[],newFinish:[]})||{}


  console.log('周报===>1111', newTodo, newInprogress, newFinish) // activeContent, newTodo, newInprogress, newFinish,

  return (
    <Drawer 
      title={'生成' + REPORT_TYPE[type]} 
      width={560}
      open={type!=='open'} 
      onOk={closeReport} 
      onCancel={closeReport}
      onClose={closeReport}
      bodyStyle={{ paddingTop: 12, paddingBottom: 12 }}
      extra={
        <>
          <Button onClick={()=>setBackCount(backCount+1)}>上一周期</Button>
          <Button style={{marginLeft: 12}} disabled={backCount === 0} onClick={()=>setBackCount(backCount-1)}>上一周期</Button>
        </>
    }
    >
      <div className={styles.report_content}>
        {
          newFinish.length + newInprogress.length + newTodo.length > 0 ?
          <>
            <h2>本周期已完成任务</h2>
            {
              newFinish.length>0?newFinish.map(item=>{
                return (
                  <div>
                    <h3>{item.content}</h3>
                    <ol>
                      {
                        item.items.map((ite, i)=>{
                          return <li>{ite.title}</li>
                        })
                      }
                    </ol>
                  </div>
                )
              }):<>暂无数据</>
            }
            <h2>本周期进行中任务</h2>
            {
              newInprogress.length>0?newInprogress.map(item=>{
                return (
                  <div>
                    <h3>{item.content}</h3>
                    <ol>
                      {
                        item.items.map((ite, i)=>{
                          return <li>{ite.title}</li>
                        })
                      }
                    </ol>
                  </div>
                )
              }):<>暂无数据</>
            }
            <h2>本周期新增任务</h2>
            {
              newTodo.length>0?newTodo.map(item=>{
                return (
                  <div>
                    <h3>{item.content}</h3>
                    <ol>
                      {
                        item.items.map((ite, i)=>{
                          return <li>{ite.title}</li>
                        })
                      }
                    </ol>
                  </div>
                )
              }):<>暂无数据</>
            }
          </>
          :<>暂无数据</>
        }
      </div>
    </Drawer>
  )
}
export default Report;