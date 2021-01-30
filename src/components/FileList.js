import React, { useState, useEffect } from 'react';
import { Input, Tree } from 'antd';
import { getChildNode } from '../utils/helper';
import { switchFileIcons } from '../utils/treeHelper';
import styles from './FileList.less';
import useContextMenu from '../hooks/useContextMenu';
import useIcpRenderer from '../hooks/useIpcRenderer';

const { ipcRenderer } = window.require('electron');

const { DirectoryTree } = Tree;

const FileList = ({
  activeId,
  files,
  newFile,
  onFileClick,
  createNewFile,
  onFileDelete,
  onFileRename,
  onImportFiles,
}) => {
  const [editStatus, setEditStatus] = useState('');
  const [inputValue, setInputValue] = useState('');
  const handleSaveInput = (path, type) => {
    onFileRename(editStatus, path, inputValue, type);
    setEditStatus('');
    setInputValue('');
  };
  const clickItem = useContextMenu(
    [
      {
        label: '新建文件',
        click: () => {
          const { current = { childNodes: [] } } = clickItem;
          if (current !== null) {
            const childNode = getChildNode(current.childNodes, 'file-item');
            const { id, type } = childNode.dataset;
            createNewFile(id, type, true);
          }
        },
      },
      {
        label: '新建文件夹',
        click: () => {
          const { current = { childNodes: [] } } = clickItem;
          if (current !== null) {
            const childNode = getChildNode(current.childNodes, 'file-item');
            const { id, type } = childNode.dataset;
            createNewFile(id, type, false);
          }
        },
      },
      {
        type: 'separator',
      },
      {
        label: '重命名',
        click: () => {
          const { current = { childNodes: [] } } = clickItem;
          if (current !== null) {
            const { dataset } = getChildNode(current.childNodes, 'file-item');
            setEditStatus(dataset.id);
            setInputValue(dataset.title);
          }
        },
      },
      {
        label: '导入',
        click: () => {
          const { current = { childNodes: [] } } = clickItem;
          if (current !== null) {
            const childNode = getChildNode(current.childNodes, 'file-item');
            const { id, type } = childNode.dataset;
            onImportFiles(id, type);
          }
        },
      },
      {
        label: '复制文件路径',
        click: () => {},
      },
      {
        type: 'separator',
      },
      {
        label: '移至回收站',
        click: () => {
          const { current = { childNodes: [] } } = clickItem;
          if (current !== null) {
            const { dataset } = getChildNode(current.childNodes, 'file-item');
            onFileDelete(dataset.id, dataset.path);
          }
        },
      },
    ],
    'ant-tree-treenode'
  );
  useEffect(() => {
    if (newFile) {
      setEditStatus(newFile.id);
      setInputValue(newFile.title);
    }
  }, [newFile]);

  const onItemClick = (isLeaf, id, path, isLoaded, type) => {
    if (!isLeaf) {
      return;
    }
    switch (type) {
      case 'setting':
        ipcRenderer.send('open-new-window', 'setting');
        // history.push('/setting');
        break;
      case 'crash':
        ipcRenderer.send('open-new-window', 'crash');
        // history.push('/crash');
        break;
      default:
        onFileClick(id, isLoaded, path);
        break;
    }
  };
  useIcpRenderer({
    'create-new-todo': () => createNewFile('todo', 'todo', true),
    'create-new-note': () => createNewFile('note', 'note', true),
    'create-new-aim': () => createNewFile('aim', 'aim', true),
    'create-new-account': () => createNewFile('account', 'account', true),
  });
  return (
    <div className={styles.FileList}>
      <DirectoryTree
        style={{
          background: '#6E6E6E',
          color: 'white',
        }}
        defaultExpandAll
        // onSelect={(_, { isLeaf, id, path, isLoaded }) => {}}
        selectedKeys={['012']}
        selectable={false}
        // onExpand={onExpand}
        treeData={switchFileIcons(files)}
        titleRender={({ key, title, id, type, isLeaf, isLoaded, path }) => {
          return (
            <span
              key={key}
              className="file-item"
              // data-isloaded={isLoaded}
              data-title={title}
              data-type={type}
              data-path={path}
              data-id={id}
            >
              {editStatus === id ? (
                <Input
                  // bordered={false}
                  placeholder="请输入"
                  value={inputValue}
                  onBlur={() => setEditStatus('')}
                  onPressEnter={() => handleSaveInput(path, type)}
                  onChange={(e) => setInputValue(e.target.value)}
                  style={{
                    width: '86%',
                    height: 23,
                    padding: '0 4px',
                    background: '#5e5e5e',
                    borderColor: '#9e9e9e',
                    color: '#fff',
                  }}
                />
              ) : (
                <span
                  style={!title ? { color: 'blue' } : {}}
                  onClick={() => {
                    onItemClick(isLeaf, id, path, isLoaded, type);
                  }}
                >
                  {title || '未命名'}
                </span>
              )}
            </span>
          );
        }}
      />
    </div>
  );
};

export default FileList;
