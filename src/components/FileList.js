import React, { useState, useEffect } from 'react';
import { Input, Tree } from 'antd';
import { getChildNode } from '../utils/helper';
import { switchFileIcons } from '../utils/treeHelper';
import styles from './FileList.less';
import useContextMenu from '../hooks/useContextMenu';
import useIpcRenderer from '../hooks/useIpcRenderer';

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
  const [selectKey, setSelectKey] = useState([]);
  const handleSaveInput = (path, type, isLeaf) => {
    onFileRename(editStatus, path, inputValue, type, isLeaf);
    if (isLeaf) {
      setSelectKey([editStatus]);
    }
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
            console.log('移至回收站', dataset);
            onFileDelete(dataset.id, dataset.path, dataset.isleaf);
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
  useIpcRenderer({
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
        selectedKeys={selectKey}
        selectable={true}
        onSelect={(key, { node }) => {
          if (editStatus) return;
          console.log('xxxonselect', node);
          const { isLeaf, id, path, isLoaded, type } = node;
          setSelectKey(key);
          onItemClick(isLeaf, id, path, isLoaded, type);
        }}
        // onExpand={onExpand}
        treeData={switchFileIcons(files)}
        titleRender={({ key, title, id, type, isLeaf, isLoaded, path }) => {
          return (
            <div
              key={key}
              className={
                type !== 'crash' && type !== 'import' ? 'file-item' : ''
              }
              // data-isloaded={isLoaded}
              data-isleaf={isLeaf} // 小写
              data-title={title}
              data-type={type}
              data-path={path}
              data-id={id}
            >
              {editStatus === id ? (
                <Input
                  autoFocus
                  placeholder="请输入"
                  value={inputValue}
                  // onBlur={() => setEditStatus('')}
                  onPressEnter={() => handleSaveInput(path, type, isLeaf)}
                  onChange={(e) => setInputValue(e.target.value)}
                  style={{
                    width: '86%',
                    height: 23,
                    padding: '0 4px',
                    background: '#5e5e5e',
                    borderColor: '#9e9e9e',
                    color: '#fff',
                    caretColor: '#fff',
                  }}
                />
              ) : (
                <span style={!title ? { color: 'orangered' } : {}}>
                  {title || '未命名'}
                </span>
              )}
            </div>
          );
        }}
      />
    </div>
  );
};

export default FileList;
