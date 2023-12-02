import React, { useState } from 'react';
import { Drawer, Form, Input, Rate, Button } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import styles from './index.less';
import DynamicTags from '../../../components/DynamicTags';

export const RateTask = [
  '不紧急、不重要',
  '不紧急、很重要',
  '很紧急、不重要',
  '很紧急、很重要',
];

const formItemLayoutWithOutLabel = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 17, offset: 6 },
  },
};

const AddModal = ({ form, handleAddTodo, open, closeModal }) => {
  const [rateText, setRateText] = useState(
    RateTask[form.getFieldValue('rate') - 1] || ''
  );
  const handleClose = () => {
    form?.resetFields();
    closeModal(false);
  };
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
            handleAddTodo(values);
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
                message: '请输入标题',
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
                message: '请输入描述',
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
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map((field, index) => (
                  <Form.Item
                    {...(index === 0 ? {} : formItemLayoutWithOutLabel)}
                    label={index === 0 ? '子任务' : ''}
                    required={false}
                    key={field.key}
                  >
                    <Form.Item
                      {...field}
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[
                        {
                          required: true,
                          whitespace: true,
                          message: '请输入子任务内容',
                        },
                      ]}
                      noStyle
                      name={[field.name, 'title']}
                    >
                      <Input
                        prefix={
                          <span className={styles.littleIndex}>
                            {index + 1}.{' '}
                          </span>
                        }
                        placeholder="子任务"
                        style={{ width: '88%' }}
                      />
                    </Form.Item>
                    {fields.length > 1 ? (
                      <MinusCircleOutlined
                        className={styles.remove}
                        onClick={() => remove(field.name)}
                        style={{ marginLeft: 10 }}
                      />
                    ) : null}
                  </Form.Item>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    className={styles.addTask}
                    icon={<PlusOutlined />}
                  >
                    添加子任务
                  </Button>
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
                  message: '请选择四象限',
                },
              ]}
            >
              <Rate
                allowClear={false}
                // value={taskRate}
                // defaultValue={ERate.zero}
                count={4}
                tooltips={RateTask}
                style={{ fontSize: 14, color: 'orangered' }}
                onChange={(num) => setRateText(RateTask[num - 1] || '')}
              />
            </Form.Item>
            <span className={styles.rateText}>{rateText}</span>
          </Form.Item>
        </Form>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            onClick={() => form.submit()}
            style={{ width: 100, marginLeft: '25%' }}
          >
            保存
          </Button>
        </Form.Item>
        {/* <Input.Group compact style={{ width: '80%', margin: '10px auto 16px' }}>
          <Input
            size="middle"
            placeholder="添加代办事项标题"
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

export default AddModal;
