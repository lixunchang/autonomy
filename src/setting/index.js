import React, { useState } from 'react';
import { Menu, Input, Button } from 'antd';
import {
  AppstoreOutlined,
  MailOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { remote, ipcRenderer } = window.require('electron');
const Store = window.require('electron-store');
const settingStore = new Store({ name: 'settings' });

const { SubMenu } = Menu;
const { Search } = Input;

const Setting = () => {
  const savedLocation =
    settingStore.get('savedFileLocatiion') ||
    `${remote.app.getPath('documents')}/cloud-note/`;
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
      settingStore.set('savedFileLocatiion', path);
      remote.getCurrentWindow().close();
    }
  };

  const uploadMenuStatus = () => {
    ipcRenderer.send('menu-config-uploaded');
  };

  const onSaveQiniuKeys = () => {
    settingStore.set('accessKey', accessKey);
    settingStore.set('secretKey', secretKey);
    settingStore.set('bucket', bucket);
    uploadMenuStatus();
    remote.getCurrentWindow().close();
  };

  return (
    <div style={{ paddingTop: 26, display: 'flex' }}>
      <Menu
        mode="inline"
        defaultOpenKeys={['sub1']}
        selectedKeys={[activeKey]}
        onClick={({ key }) => setAcitveKey(key)}
        style={{ width: 126, height: '100%' }}
      >
        <SubMenu key="sub1" icon={<MailOutlined />} title="主题">
          <Menu.Item key="side">侧边栏</Menu.Item>
          <Menu.Item key="editor">编辑器</Menu.Item>
        </SubMenu>
        <SubMenu key="sub2" icon={<AppstoreOutlined />} title="功能">
          <Menu.Item key="function">功能选择</Menu.Item>
          <Menu.Item key="path">保存路径</Menu.Item>
        </SubMenu>
        <SubMenu key="sub4" icon={<SettingOutlined />} title="第三方">
          <Menu.Item key="qiniu">七牛云</Menu.Item>
          <Menu.Item key="support">赞助</Menu.Item>
        </SubMenu>
      </Menu>
      <div style={{ marginLeft: 16 }}>
        <h2>设置</h2>
        {activeKey === 'path' && (
          <div>
            <h3>选择文件保存位置</h3>
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
            <h3>填写七牛云accessKey和secretKey</h3>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <sapn style={{ width: 120 }}>accessKey:</sapn>
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
              <span style={{ width: 120 }}>secretKey:</span>
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
              <span style={{ width: 120 }}>Bucket名称:</span>
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
      </div>
    </div>
  );
};

export default Setting;
