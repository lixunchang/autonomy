import React, { useState, useEffect } from 'react';
import { Button, Drawer, Segmented } from 'antd';
import moment from 'moment';
import styles from './index.less';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

export const REPORT_TYPE = {
  'day': '日报',
  'week': '周报',
  'month': '月报', 
  'year': '年报',
  'lastMonth': '近一月',
  'lastYear': '近一年'
};

const inCycle=(time, cycleType = 'week', backCount = 0)=>{
  if(!time){
    return false;
  }
  
  if(cycleType === 'lastMonth') {
    const targetTime = moment().subtract(1, 'months');
    return moment(time).isAfter(targetTime);
  }
  
  if(cycleType === 'lastYear') {
    const targetTime = moment().subtract(1, 'years'); 
    return moment(time).isAfter(targetTime);
  }
  
  const targetTime = moment().subtract(backCount, cycleType);
  return moment(time).isBetween(targetTime.startOf(cycleType).valueOf(), targetTime.endOf(cycleType).valueOf())
}

const Report = ({ type, activeFile, closeReport }) => {
  const [backCount, setBackCount] = useState(0);
  const [reportType, setReportType] = useState(type);

  // 获取当前周期的起止时间
  const getCurrentPeriod = () => {
    const targetTime = moment().subtract(backCount, reportType);
    const start = targetTime.startOf(reportType).format('YYYY-MM-DD');
    const end = targetTime.endOf(reportType).format('YYYY-MM-DD');
    return `${start} 至 ${end}`;
  };

  // 1. 使用 useEffect 监听 reportType 变化
  useEffect(() => {
    // 切换周期类型时重置回溯计数
    setBackCount(0);
  }, [reportType]);

  const activeContent = JSON.parse(activeFile.body||'[]');
  // 2. 修改 inCycle 调用时使用 reportType 替代 type
  const { newTodo=[], newInprogress=[], newFinish=[] } = activeContent.reduce((total, column)=>{
    // 检查 column.tasks 是否存在
    if (!column.tasks || !Array.isArray(column.tasks)) {
      return total;
    }

    const {newTodo=[], newInprogress=[], newFinish=[]} = column.tasks.reduce((taskTotal, task)=>{
      const newTd=[], newIP=[], newFI=[];

      if(inCycle(task.createTime, reportType, backCount)){
        newTd.push({...task, items: task.items || []});
      }else if(task.items && task.items.length){
        const inCycleItems = task.items.filter(item=>inCycle(item.createTime, reportType, backCount));
        if(inCycleItems.length > 0){
          newTd.push({
            ...task,
            items: inCycleItems
          });
        }
      }

      // 检查进行中任务
      if(inCycle(task.inprogressTime, reportType, backCount)){
        newIP.push({...task, items: task.items || []});
      }

      // 检查已完成任务
      if(inCycle(task.finishTime, reportType, backCount)){
        newFI.push({...task, items: task.items || []});
      }else if(task.items && task.items.length){
        const inCycleItems = task.items.filter(item=>inCycle(item.finishTime, reportType, backCount));
        if(inCycleItems.length > 0){
          newFI.push({
            ...task,
            items: inCycleItems
          });
        }
      }

      return {
        newTodo: [...taskTotal.newTodo, ...newTd],
        newInprogress: [...taskTotal.newInprogress, ...newIP], 
        newFinish: [...taskTotal.newFinish, ...newFI]
      };
    }, {newTodo:[],newInprogress:[],newFinish:[]});

    return {
      newTodo: [...total.newTodo, ...newTodo],
      newInprogress: [...total.newInprogress, ...newInprogress],
      newFinish: [...total.newFinish, ...newFinish]
    };
  }, {newTodo:[],newInprogress:[],newFinish:[]});


  console.log('周报===>1111', newTodo, newInprogress, newFinish) // activeContent, newTodo, newInprogress, newFinish,

  return (
    <Drawer 
      title="生成报告"
      width={560}
      open={type!=='open'} 
      onClose={closeReport}
      className={styles.report_drawer}
      bodyStyle={{ paddingTop: 12, paddingBottom: 12 }}
      extra={
        <div className={styles.periodSelector}>
          <LeftOutlined 
            className={styles.arrow} 
            onClick={()=>setBackCount(backCount+1)}
          />
          <Segmented
            value={reportType}
            onChange={setReportType}
            options={Object.entries(REPORT_TYPE)
              .filter(([key]) => !['lastMonth', 'lastYear'].includes(key))
              .map(([key, label]) => ({
                label,
                value: key,
              }))}
          />
          <RightOutlined 
            className={styles.arrow}
            onClick={()=>setBackCount(Math.max(0, backCount-1))}
          />
        </div>
      }
    >
      <div className={styles.report_content}>
        <div className={styles.periodTime}>{getCurrentPeriod()}</div>
        {
          newFinish.length + newInprogress.length + newTodo.length > 0 ?
          <>
            <h4>任务进展</h4>
            <div className={styles.section}>
              {
                (newFinish.length > 0 || newInprogress.length > 0) ? 
                [...newFinish, ...newInprogress].map((item)=>{
                  return (
                    <div className={styles.section_item} key={item.id}>
                      <div className={styles.title}>
                        <span>{item.content}</span>
                      </div>
                      <ol>
                        {
                          item.items.map((ite, i)=>{
                            return (
                              <li key={i}>
                                {ite.title}
                                {newFinish.find(f => f.id === item.id) ? 
                                  <CheckCircleOutlined style={{color: '#52c41a', marginLeft: 8}} /> :
                                  <ClockCircleOutlined style={{color: '#1890ff', marginLeft: 8}} />
                                }
                              </li>
                            )
                          })
                        }
                      </ol>
                    </div>
                  )
                }) : <div className={styles.empty_text}>暂无数据</div>
              }
            </div>
            <h4>本期新增</h4>
            <div className={styles.section}>
              {
                newTodo.length>0?newTodo.map(item=>{
                  return (
                    <div className={styles.section_item} key={item.id}>
                      <div className={styles.title}>{item.content}</div>
                      <ol>
                        {
                          item.items.map((ite, i)=>{
                            return <li key={i}>{ite.title}</li>
                          })
                        }
                      </ol>
                    </div>
                  )
                }):<div className={styles.empty_text}>暂无数据</div>
              }
            </div>
          </>
          :<div className={styles.empty_text}>暂无数据</div>
        }
      </div>
    </Drawer>
  )
}
export default Report;