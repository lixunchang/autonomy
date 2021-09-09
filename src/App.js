import { useState } from 'react';
import styles from './App.less';
import { Row, Col } from 'antd';
import moment from 'moment';
import FileSearch from './components/FileSearch';
import FileList from './components/FileList';
import Note from './note';
import Todo from './todo';
import Aim from './aim';
import {
  defaultFiles,
  importChildren,
  findItemById,
  editItemById,
  createItemByFatherId,
  deleteItemById,
  findItemsByIds,
  getIconByFileType,
  deleteExtraAttr,
  deepClone,
} from './utils/treeHelper';
import emptyImg from '../public/empty.png';
import shortid from 'shortid';
import fileHelper from './utils/fileHelper';
import useIpcRenderer from './hooks/useIpcRenderer';
// Node API
const { remote, ipcRenderer } = window.require('electron');
const { join, basename, extname, dirname } = window.require('path');
const Store = window.require('electron-store');

const fileStore = new Store({ name: 'Files Data' });
const settingStore = new Store({ name: 'settings' });
// fileStore.delete('files');

const getAutoSync = () =>
  ['accessKey', 'secretKey', 'bucket', 'enableAutoSync'].every(
    (key) => !!settingStore.get(key)
  );

/**
 * state分析
 * - 文件列表 【】
 * - 搜索后的文件列表 key
 * - 未保存的文件列表 [id]
 * - 已经打开的文件列表 [id]
 * - 当前选中的文件
 */
function App() {
  const [files, setFiles] = useState(fileStore.get('files') || defaultFiles);
  const [activeFileId, setActiveFileId] = useState('');
  const [openedFileIds, setOpenedFileIds] = useState([]);
  const [unsavedFileIds, setUnsavedFileIds] = useState([]);
  const [newFile, setNewFile] = useState(null);

  const activeFile = findItemById(files, activeFileId);
  const openedFiles = findItemsByIds(files, openedFileIds);
  const unsavedFiles = findItemsByIds(files, unsavedFileIds);
  const savedLocation =
    settingStore.get('savedFileLocatiion') ||
    `${remote.app.getPath('documents')}/cloud-note/`;

  const saveFile2Store = (data) => {
    const newData = deleteExtraAttr(deepClone(data));
    fileStore.set('files', newData);
  };

  const clearUnsavedFile = (id) => {
    const newUnsavedFileIds = unsavedFileIds.filter((fileId) => fileId !== id);
    setUnsavedFileIds(newUnsavedFileIds);
  };

  const closeOpenedFile = (id) => {
    const newOpenedFileIds = openedFileIds.filter((openId) => openId !== id);
    setOpenedFileIds(newOpenedFileIds);
    if (newOpenedFileIds.length > 0) {
      setActiveFileId(newOpenedFileIds[newOpenedFileIds.length - 1]);
    } else {
      setActiveFileId('');
    }
  };

  const openClickedFile = (id, isLoaded, path) => {
    const curFile = findItemById(files, id);
    console.log('++++', path, id, curFile, isLoaded, getAutoSync());
    if (!isLoaded && path) {
      // TODO
      if (getAutoSync()) {
        ipcRenderer.send('download-file', {
          key: `${curFile.title}.md`,
          path: curFile.path,
          id: curFile.id,
          updatedAt: curFile.updatedAt,
        });
      } else {
        fileHelper.readFile(path).then((val) => {
          console.log('readFile-222', path, val);
          const newFiles = editItemById(files, id, {
            body: val,
            isLoaded: true,
          });
          setFiles(newFiles);
          if (!openedFileIds.includes(id)) {
            setOpenedFileIds([...openedFileIds, id]);
          }
        });
      }
      setActiveFileId(id);
    } else {
      setActiveFileId(id);
      if (!openedFileIds.includes(id)) {
        setOpenedFileIds([...openedFileIds, id]);
      }
    }
  };
  const deleteFile = (id, path) => {
    fileHelper.deleteFile(path).then(() => {
      const newFiles = deleteItemById(files, id);
      saveFile2Store(newFiles);
      setFiles(newFiles);
      closeOpenedFile(id);
      clearUnsavedFile(id);
    });
  };
  const createNewFile = (fatherId, type, isLeaf) => {
    const folder = isLeaf ? {} : { children: [] };
    const newId = shortid.generate();
    const newPath = join(
      savedLocation,
      `${newId}${type === 'note' ? '.md' : '.json'}`
    );
    const newFile = {
      id: newId,
      title: '',
      path: newPath,
      key: newId,
      type,
      icon: getIconByFileType(type, isLeaf),
      createAt: moment().valueOf(),
      isLeaf,
      isSync: false,
      updatedAt: 0,
      ...folder,
    };
    const newFiles = createItemByFatherId(files, fatherId, newFile);
    fileHelper
      .writeFile(newPath, type === 'note' ? '## 请输入markdown' : '{}')
      .then((res) => {
        console.log('新建', newFiles, res);
        setNewFile(newFile);
        setFiles(newFiles);
      });
  };
  const renameFile = (id, path, title, type) => {
    const newPath = `${dirname(path)}/${title}${
      type === 'note' ? '.md' : '.json'
    }`;
    fileHelper.renameFile(path, newPath).then(() => {
      const newFiles = editItemById(files, id, { title, path: newPath });
      saveFile2Store(newFiles);
      setFiles(newFiles);
      setNewFile(null);
    });
  };

  const fileChange = (id, value) => {
    console.log('fileChange', id, value);
    if (value !== activeFile.body) {
      const newFiles = editItemById(files, id, { body: value });
      setFiles(newFiles);
      if (!unsavedFileIds.includes(id)) {
        setUnsavedFileIds([...unsavedFileIds, id]);
      }
    }
  };

  const saveEditFile = () => {
    const { path, body, title } = activeFile;
    if (activeFile.type === 'note') {
      fileHelper.writeFile(path, body).then(() => {
        setUnsavedFileIds(unsavedFileIds.filter((id) => id !== activeFileId));
        if (getAutoSync()) {
          ipcRenderer.send('upload-file', {
            key: `${title}.md`,
            path: path,
          });
        }
      });
    }
  };

  const onImportFiles = (id, type) => {
    remote.dialog
      .showOpenDialog({
        title: '选择导入MD文档',
        filters: [{ name: 'Markdown Files', extension: ['md'] }],
        properties: ['openFile', 'multiSelections'],
      })
      .then(({ filePaths }) => {
        if (Array.isArray(filePaths)) {
          // TODO 过滤已经添加过的文件
          const children = filePaths.map((path) => {
            const newId = shortid.generate();
            return {
              id: newId,
              title: basename(path, extname(path)),
              path,
              key: newId,
              type,
              icon: getIconByFileType(type, true),
              createAt: moment().valueOf(),
              isLeaf: true,
              isSync: false,
              updatedAt: 0,
            };
          });
          const newFiles = importChildren(files, id, children);
          saveFile2Store(newFiles);
          setFiles(newFiles);
          if (children.length > 0) {
            remote.dialog.showMessageBox({
              type: 'info',
              title: `导入成功`,
              message: `成功导入了${children.length}个文件`,
            });
          }
        }
      });
  };

  const activeFileUploaded = () => {
    const newFiles = editItemById(files, activeFileId, {
      isSynced: true,
      uploadedAt: moment().valueOf(),
    });
    setFiles(newFiles);
    saveFile2Store(newFiles);
  };

  const activeFileDownloaded = (_, data) => {
    console.log('activeFileDownloaded++++', data);
    const curFile = findItemById(files, data.id);
    console.log('activeFileDownloaded++++', curFile.path);
    fileHelper.readFile(curFile.path).then((value) => {
      console.log('readFile++++++', value);
      let newData;
      if (data.status === 'downloaded-success') {
        newData = {
          body: value,
          isLoaded: true,
          isSynced: true,
          updatedAt: moment().valueOf(),
        };
      } else {
        newData = {
          body: value,
          isLoaded: true,
        };
      }
      console.log('activeFileDownloaded', newData);
      const newFiles = editItemById(files, data.id, newData);
      setFiles(newFiles);
      saveFile2Store(newFiles);
    });
  };
  useIpcRenderer({
    'active-file-uploaded': activeFileUploaded,
    'file-downloaded': activeFileDownloaded,
    'save-edit-file': saveEditFile,
  });
  console.log('activeFileId', activeFile);
  return (
    <div className={styles.App}>
      <div style={{ height: '100%', display: 'flex' }}>
        <div
          style={{
            width: '28%',
            background: '#6E6E6E',
            color: 'white',
            minWidth: 260,
          }}
        >
          <div className={styles.dragArea} />
          <FileSearch
            title=""
            onFileSearch={(val) => {
              console.log(val);
            }}
          />
          <FileList
            activeId={activeFileId}
            files={deepClone(files)}
            newFile={newFile}
            openedFiles={openedFiles}
            onImportFiles={onImportFiles}
            closeOpenedFile={closeOpenedFile}
            unsavedFileIds={unsavedFileIds}
            onFileClick={openClickedFile}
            createNewFile={createNewFile}
            onFileDelete={deleteFile}
            onFileRename={renameFile}
          />
        </div>
        <div style={{ flex: 1, backgroundColor: '#fafbfc' }}>
          {!activeFile ? (
            <div className={styles.empty}>
              <div
                style={{ width: '100%', position: 'absolute', top: 0 }}
                className={styles.dragArea}
              />
              <img src={emptyImg} alt="没有数据" />
              <span className={styles.emptyWord}>空空如也</span>
            </div>
          ) : (
            <>
              <h1
                className={styles.dragArea}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 58,
                  padding: '0 58px',
                  fontSize: 26,
                  fontWeight: 600,
                  margin: 0,
                  backgroundColor: '#fafbfc',
                }}
              >
                {unsavedFileIds.includes(activeFileId) && (
                  <span className={styles.unsaveIcon} />
                )}
                {activeFile.title}
              </h1>
              {activeFile.type === 'todo' ? (
                <Todo activeFile={activeFile} onChange={fileChange} />
              ) : activeFile.type === 'note' ? (
                <Note activeFile={activeFile} onChange={fileChange} />
              ) : activeFile.type === 'aim' ? (
                <Aim activeFile={activeFile} onChange={fileChange} />
              ) : (
                <div className={styles.empty}>
                  <h3 style={{ color: 'red' }}>
                    {activeFile.title}, 正在开发中...
                  </h3>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
