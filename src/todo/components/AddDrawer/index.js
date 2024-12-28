import React, { useEffect, useState } from "react";
import { Drawer, Form, Input, Rate, Button, InputNumber, Space, Select } from "antd";
import { MinusCircleOutlined, PlusOutlined, DownOutlined, UpOutlined, StarFilled } from "@ant-design/icons";
import styles from "./index.less";
import DynamicTags from "../../../components/DynamicTags";

export const RateTask = [
  "（低）不紧急且不重要",
  "（中）不重要但紧急",
  "（高）重要不紧急",
  "（急）重要且紧急",
];

const colors = ['#666','#00ac84','#1677ff','#fac814','#fc4646']

const formItemLayoutWithOutLabel = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 17, offset: 6 },
  },
};

const AddDrawer = ({ form, handleAddTodo, open, closeModal }) => {
  const [rateText, setRateText] = useState(
    RateTask[form.getFieldValue("rate") - 1] || "",
  );
  const [tasks, setOriginTasks] = useState([])
  const [doneCollapse, setDoneCollapse] = useState(true);
  // const tasks = form.getFieldValue('items')||[];
  const progress = tasks.filter(ite=>ite.checked).length;

  const totalLength = tasks.length;


  const handleDownCollapseChange=(newDoneCollapse, initTask)=>{
    const curTasks = initTask || tasks;
    if(newDoneCollapse){
      const showTasks = curTasks.filter(item=>!item.checked);
      if(!showTasks.length){
        const emptyTask = {createTime: Date.now()}
        showTasks.push(emptyTask)
        setOriginTasks([...curTasks, emptyTask])
      }
      form.setFieldValue('items', showTasks)
    }else{
      form.setFieldValue('items', curTasks)
    }
    setDoneCollapse(newDoneCollapse)
  }
  useEffect(()=>{
    setTimeout(()=>{
      const tasks = form.getFieldValue('items');
      setOriginTasks(tasks||[])
      // console.log('uuuuEEEEFFFF', tasks)
      handleDownCollapseChange(doneCollapse, tasks)
    }, 0)
  },[])

  const handleClose = () => {
    form?.resetFields();
    closeModal(false);
  };

  const handleDeleteOriginField=(index)=>{
    const currentTasks = form.getFieldValue('items');
    setOriginTasks(tasks.filter((item)=>item.createTime!==currentTasks[index].createTime))
  }

  const handleTaskChange = (index, data) => {
    const currentTasks = form.getFieldValue('items');
    // console.log('cccc', currentTasks[index], data)
    setOriginTasks(tasks.map(item=>{
      if(item.createTime === currentTasks[index].createTime){
        return {
          ...currentTasks[index],
          ...data
        }
      }
      return item;
    }))
  }
  const showStatusClass=(index)=>{
    return form.getFieldValue('items')[index].checked? styles.doneTaskIndex:'';
  }

  return (
    <>
      <Drawer
        title="添加事项"
        width={560}
        open={open}
        onClose={closeModal}
        onCancel={closeModal}
        bodyStyle={{ paddingTop: 52, paddingBottom: 52 }}
      >
        <Form
          form={form}
          name="basic"
          labelCol={{
            span: 6,
          }}
          wrapperCol={{
            span: 17,
          }}
          style={{
            maxWidth: 600,
          }}
          onFinish={(values) => {
            console.log('on-finish', values, tasks)
            handleAddTodo({...values, items: tasks});
            handleClose();
          }}
          autoComplete="off"
        >
          <Form.Item name="id" noStyle>
            <></>
          </Form.Item>
          <Form.Item
            label="标题"
            name="title"
            rules={[
              {
                required: true,
                message: "请输入标题",
              },
            ]}
          >
            <Input
              size="middle"
              placeholder="请输入"
              style={
                {
                  // width: '10%',
                }
              }
              // value={inputTask}
              // onPressEnter={handleAddTask}
              // onChange={(e) => setInputTask(e.target.value)}
            />
          </Form.Item>
          <Form.Item
            label="描述"
            name="desc"
            rules={[
              {
                message: "请输入描述",
              },
            ]}
          >
            <Input.TextArea size="middle" placeholder="添加描述" />
          </Form.Item>
          <Form.List
            name="items"
            // rules={[
            //   {
            //     validator: async (_, names) => {
            //       if (!names || names.length < 2) {
            //         return Promise.reject(new Error('At least 2 passengers'));
            //       }
            //     },
            //   },
            // ]}
            initialValues={{level: 1}}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map(({key, name, ...restField}, index) => (
                  <Form.Item
                    {...(index === 0 ? {} : formItemLayoutWithOutLabel)}
                    label={index === 0 ? "子任务" : ""}
                    required={false}
                    key={key}
                  >
                    <Space.Compact style={{ width: "calc(100% - 24px)" }}>
                      <Form.Item
                        {...restField}
                        validateTrigger={["onChange", "onBlur"]}
                        rules={[
                          {
                            required: true,
                            whitespace: true,
                            message: "请输入子任务内容",
                          },
                        ]}
                        noStyle
                        name={[name, "title"]}
                      >
                        <Input
                          prefix={
                            <span className={`${styles.littleIndex}`}>
                              <span className={showStatusClass(index)}>{index + 1}</span>.{" "}
                            </span>
                          }
                          placeholder="子任务"
                          style={{ width: "calc(100% - 38px)" }}
                          onChange={(e)=>handleTaskChange(name, {title: e.target.value})}
                        />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        validateTrigger={["onChange", "onBlur"]}
                        noStyle
                        initialValue={1}
                        name={[name, "level"]}
                      >
                        <Select
                          style={{ width: 38 }}
                          suffixIcon={null}
                          options={[
                            { value: 1, label: <StarFilled style={{color: '#00ac84'}}/> },
                            { value: 2, label: <StarFilled style={{color: '#1677ff'}}/> },
                            { value: 3, label: <StarFilled style={{color: '#fac814'}}/>},
                            { value: 4, label: <StarFilled style={{color: '#fc4646'}}/> },
                          ]}
                          onChange={(value)=>handleTaskChange(name, {level: value})}
                        />
                      </Form.Item>
                    </Space.Compact>
                    {/* {JSON.stringify(field)} */}
                    {fields.length > 1 ? (
                      <MinusCircleOutlined
                        className={styles.remove}
                        onClick={() => {
                          handleDeleteOriginField(name)
                          remove(name)
                        }}
                        style={{ marginLeft: 10 }}
                      />
                    ) : null}
                  </Form.Item>
                ))}
                <Form.Item {...formItemLayoutWithOutLabel}>
                    <Button
                      type="dashed"
                      onClick={() => {
                        const newTask = { createTime: Date.now() }
                        setOriginTasks([...tasks, newTask])
                        add(newTask)
                      }}
                      className={styles.addTask}
                      icon={<PlusOutlined />}
                    >
                      添加子任务
                    </Button>
                    {
                      totalLength>0&&
                      <span className={styles.collapseIcon} >
                        <span onClick={()=>handleDownCollapseChange(!doneCollapse)}>
                          {progress}
                          <i style={{marginInline:'2px'}}>/</i>
                          {totalLength}
                          {
                            doneCollapse ? <DownOutlined className="icon"/>: <UpOutlined className="icon"/>
                          }
                        </span>
                      </span>
                    } 
                    {/* <Button
                      type="dashed"
                      onClick={() => {
                        add('The head item', 0);
                      }}
                      style={{ width: '60%', marginTop: '20px' }}
                      icon={<PlusOutlined />}
                    >
                      Add field at head
                    </Button> */}
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item name="tags" label="标签">
            <DynamicTags />
          </Form.Item>
          <Form.Item label={<span>四象限</span>} required={true}>
            <Form.Item
              noStyle
              name="rate"
              rules={[
                {
                  required: true,
                  message: "请选择四象限",
                },
              ]}
            >
              <Rate
                allowClear={false}
                // value={taskRate}
                // defaultValue={ERate.zero}
                count={4}
                tooltips={RateTask}
                style={{ fontSize: 14, color: colors[form.getFieldValue('rate')||1] }}
                onChange={(num) => setRateText(RateTask[num - 1] || "")}
              />
            </Form.Item>
            <span className={styles.rateText}>{rateText}</span>
          </Form.Item>
        </Form>

        {/* <Form.Item> */}
        <Button
          type="primary"
          htmlType="submit"
          onClick={() => form.submit()}
          style={{ width: 100, marginLeft: "25%" }}
        >
          保存
        </Button>
        {/* </Form.Item> */}
        {/* <Input.Group compact style={{ width: '80%', margin: '10px auto 16px' }}>
          <Input
            size="middle"
            placeholder="添加待办事项标题"
            style={{
              width: '50%',
            }}
            value={inputTask}
            onPressEnter={handleAddTask}
            onChange={(e) => setInputTask(e.target.value)}
          />
          <Input.Search
            className={styles.inputSearch}
            enterButton={
              <Button
                type="primary"
                style={{ width: 80, background: '#6E6E6E' }}
              >
                添加
              </Button>
            }
            style={{
              width: '50%',
            }}
            size="middle"
            suffix={rate}
            value={inputTaskDesc}
            onChange={(e) => setInputTaskDesc(e.target.value)}
            onSearch={handleAddTask}
          />
        </Input.Group> */}
      </Drawer>
    </>
  );
};

export default AddDrawer;
