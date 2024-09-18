import React, { useState } from 'react';
import { Menu, Input, Button, DatePicker, InputNumber } from 'antd';
import {
  AppstoreOutlined,
  MailOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { getSaveLocation } from '../utils/helper';
import styles from './index.less';
import moment from 'moment';

const isDev = window.require('electron-is-dev');
const { remote, ipcRenderer } = window.require('electron');
const Store = window.require('electron-store');
const settingStore = new Store({
  name: isDev ? 'Settings_dev' : 'Settings',
});
const splashStorage = new Store({
  name: isDev ? 'Splashs_dev' : 'Splashs',
});

const { SubMenu } = Menu;
const { Search } = Input;

const Setting = () => {
  const savedLocation = getSaveLocation();
  const [path, setPath] = useState(savedLocation || '');
  const [activeKey, setAcitveKey] = useState('path');
  const [accessKey, setAccessKey] = useState(
    settingStore.get('accessKey') || ''
  );
  const [secretKey, setSecretKey] = useState(
    settingStore.get('secretKey') || ''
  );
  const [bucket, setBucket] = useState(settingStore.get('bucket') || '');

  const handleSelectFolder = () => {
    remote.dialog
      .showOpenDialog({
        properties: ['openDirectory'],
        message: '选择文件的储存路径',
      })
      .then(({ filePaths }) => {
        if (Array.isArray(filePaths)) {
          const [path] = filePaths;
          setPath(path);
        }
      });
  };

  const onSavePath = () => {
    if (path) {
      settingStore.set('savedFileLocation', path);
      remote.getCurrentWindow().close();
    }
  };

  const uploadMenuStatus = () => {
    ipcRenderer.send('menu-config-uploaded');
  };

  const onSaveQiniuKeys = () => {
    settingStore.set('accessKey', accessKey || '');
    settingStore.set('secretKey', secretKey || '');
    settingStore.set('bucket', bucket || '');
    uploadMenuStatus();
    remote.getCurrentWindow().close();
  };

  return (
    <div className={styles.Setting}>
      <div
        style={{
          width: 220,
          height: '100%',
          background: '#f0f0f0',
        }}
      >
        <div className={styles.dragArea} />
        <Menu
          mode="inline"
          defaultOpenKeys={['sub1', 'sub2', 'sub3']}
          selectedKeys={[activeKey]}
          onClick={({ key }) => setAcitveKey(key)}
          style={{
            width: 220,
            height: '100%',
            background: '#f0f0f0',
          }}
        >
          <SubMenu key="sub1" icon={<MailOutlined />} title="主题">
            <Menu.Item key="start">启动页</Menu.Item>
            <Menu.Item key="side">侧边栏</Menu.Item>
            <Menu.Item key="editor">编辑器</Menu.Item>
          </SubMenu>
          <SubMenu key="sub2" icon={<AppstoreOutlined />} title="功能">
            <Menu.Item key="function">功能选择</Menu.Item>
            <Menu.Item key="path">保存路径</Menu.Item>
          </SubMenu>
          <SubMenu key="sub3" icon={<SettingOutlined />} title="第三方">
            <Menu.Item key="qiniu">七牛云</Menu.Item>
            <Menu.Item key="support">赞助</Menu.Item>
          </SubMenu>
        </Menu>
      </div>
      <div style={{ flex: 1 }}>
        <h3 className={styles.dragArea2}>设置</h3>
        <div style={{ margin: '0 26px' }}>
          {activeKey === 'start' && (
            <div>
              <div style={{marginBottom: 14}}><span style={{marginRight: 24, color: '#999'}}>出生年月日（公历）:</span>
              <DatePicker defaultValue={moment(splashStorage.get('birthday')||'1995-05-20')} onChange={e=>splashStorage.set('birthday', moment(e).format('YYYY/MM/DD'))} /></div>
              <div style={{marginBottom: 14}}><span style={{marginRight: 10, color: '#999'}}>人生开始年岁（通识）:</span>
              <InputNumber min={0} max={100} defaultValue={splashStorage.get('lifeStart')||0} onChange={e=>splashStorage.set('lifeStart', e)} />岁</div>
              <div style={{marginBottom: 14}}><span style={{marginRight: 10, color: '#999'}}>人生结束年岁（通识）:</span>
              <InputNumber min={1} max={100} defaultValue={splashStorage.get('lifeEnd')||80} onChange={e=>splashStorage.set('lifeEnd', e)} />岁</div>
              <div style={{marginBottom: 14}}><span style={{marginRight: 10, color: '#999'}}>事业开始年份（通识）:</span>
              <InputNumber min={1} max={100} defaultValue={splashStorage.get('careerStart')||25} onChange={e=>splashStorage.set('careerStart', e)} />岁</div>
              <div style={{marginBottom: 14}}><span style={{marginRight: 10, color: '#999'}}>事业定型年份（通识）:</span>
              <InputNumber min={1} max={100} defaultValue={splashStorage.get('careerEnd')||45} onChange={e=>splashStorage.set('careerEnd', e)} />岁</div>
              <div style={{marginBottom: 14}}><span style={{marginRight: 10, color: '#999'}}>成年开始年份（通识）:</span>
              <InputNumber min={1} max={100} defaultValue={splashStorage.get('aduitStart')||18} onChange={e=>splashStorage.set('aduitStart', e)} />岁</div>
              <div style={{marginBottom: 14}}><span style={{marginRight: 10, color: '#999'}}>成年结束年份（通识）:</span>
              <InputNumber min={1} max={100} defaultValue={splashStorage.get('aduitEnd')||80} onChange={e=>splashStorage.set('aduitEnd', e)} />岁</div>
            </div>
          )}
          {activeKey === 'path' && (
            <div>
              <h5>选择文件保存位置</h5>
              <Search
                value={path}
                placeholder="新的地址"
                enterButton="选择新的地址"
                onSearch={handleSelectFolder}
                size="default"
              />
              <Button
                onClick={onSavePath}
                type="primary"
                style={{ marginTop: 12 }}
              >
                保存
              </Button>
            </div>
          )}
          {activeKey === 'qiniu' && (
            <div>
              <h5>填写七牛云accessKey和secretKey</h5>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <sapn
                  style={{
                    width: 124,
                    color: '#999',
                    textAlign: 'right',
                    marginRight: 8,
                  }}
                >
                  accessKey :
                </sapn>
                <Input
                  value={accessKey}
                  placeholder="七牛云accessKey"
                  size="default"
                  onChange={(e) => setAccessKey(e.target.value)}
                />
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', marginTop: 14 }}
              >
                <span
                  style={{
                    width: 124,
                    color: '#999',
                    textAlign: 'right',
                    marginRight: 8,
                  }}
                >
                  secretKey :
                </span>
                <Input
                  value={secretKey}
                  placeholder="七牛云secretKey"
                  size="default"
                  onChange={(e) => setSecretKey(e.target.value)}
                />
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', marginTop: 14 }}
              >
                <span
                  style={{
                    width: 124,
                    color: '#999',
                    textAlign: 'right',
                    marginRight: 8,
                  }}
                >
                  Bucket名称 :
                </span>
                <Input
                  value={bucket}
                  placeholder="七牛云bucket"
                  size="default"
                  onChange={(e) => setBucket(e.target.value)}
                />
              </div>
              <Button
                onClick={onSaveQiniuKeys}
                type="primary"
                style={{ marginTop: 12 }}
              >
                保存
              </Button>
            </div>
          )}
          {activeKey !== 'path' && activeKey !== 'qiniu' && activeKey !== 'start' && (
            <span style={{ color: 'orangered', marginTop: 26 }}>
              ## 功能开发中...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Setting;
