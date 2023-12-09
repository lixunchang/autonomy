import { useState, useEffect } from 'react';
import styles from './App.less';
import moment from 'moment';
import FileSearch from './components/FileSearch';
import FileList from './components/FileList';
import Note from './note';
import Todo from './todo';
import Aim from './aim';
import {
  defaultFiles,
  initAllFiles,
  importChildren,
  findItemById,
  editItemById,
  createItemByFatherId,
  deleteItemById,
  getChildrenFilePath,
  getIconByFileType,
  deleteExtraAttr,
  deepClone,
  defaultKeys,
} from './utils/treeHelper';
import emptyImg from '../public/empty.png';
import shortid from 'shortid';
import fileHelper from './utils/fileHelper';
import useIpcRenderer from './hooks/useIpcRenderer';
import Draggable from 'react-draggable';
import { getSaveLocation, getAutoSync } from './utils/helper';
import Music from './music';
import { message } from 'antd';
// Node API
const { remote, ipcRenderer } = window.require('electron');
const { join, basename, extname, dirname } = window.require('path');
const Store = window.require('electron-store');
const isDevelop = true;
const fileStore = new Store({ name: isDevelop ? 'Dev Data' : 'Files Data' });
// fileStore.set('files', defaultFiles); //重置操作 22.14.13

const savedLocation = getSaveLocation();

const defaultSiderWidth = 260;
const miniSiderWidth = 190;
const maxSiderWidth = 360;

/**
 * state分析
 * - 文件列表 【】
 * - 搜索后的文件列表 key
 * - 未保存的文件列表 [id]
 * - 已经打开的文件列表 [id]
 * - 当前选中的文件
 */
function App() {
  const [files, setFiles] = useState(
    initAllFiles(fileStore.get('files'), defaultFiles)
  );
  // console.log('remote.app.getPath', remote.app.getPath('userData'));
  const [activeFileId, setActiveFileId] = useState(
    fileStore.get('activeFileId')
  );
  const [openedFileIds, setOpenedFileIds] = useState([]);
  const [unsavedFileIds, setUnsavedFileIds] = useState([]);
  const [newFile, setNewFile] = useState(null);
  const [siderWidth, setSiderWidth] = useState(defaultSiderWidth);
  const [expandedKeys, setExpandedKeys] = useState(
    fileStore.get('expandedKeys')
  );

  useEffect(() => {
    if (fileStore) {
      fileStore.set('expandedKeys', expandedKeys);
    }
  }, [expandedKeys]);

  const activeFile = findItemById(files, activeFileId);
  useEffect(() => {
    if (activeFile && !activeFile.isLoaded) {
      openClickedFile(activeFileId, activeFile.isLoaded, activeFile.path);
    }
  }, []);
  // const openedFiles = findItemsByIds(files, openedFileIds);
  // const unsavedFiles = findItemsByIds(files, unsavedFileIds);
  useEffect(() => {
    if (fileStore) {
      fileStore.set('activeFileId', activeFileId);
    }
  }, [activeFileId]);
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

  const saveBeforSwitchFile = (id, isLoaded, path) => {
    if (activeFile) {
      saveEditFile().then(() => {
        openClickedFile(id, isLoaded, path);
      });
    } else {
      openClickedFile(id, isLoaded, path);
    }
  };

  const openClickedFile = (id, isLoaded, path) => {
    const isExists = fileHelper.exists(path);
    const curFile = findItemById(files, id);
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
        if (!isExists) {
          fileHelper.writeFile(path, '').then(() => {
            const newFiles = editItemById(files, id, {
              body: '',
              isLoaded: true,
            });
            setFiles(newFiles);
            if (!openedFileIds.includes(id)) {
              setOpenedFileIds([...openedFileIds, id]);
            }
          });
        } else {
          fileHelper.readFile(path).then((val) => {
            // console.log('readFile-222', path, val);
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
      }
      setActiveFileId(id);
    } else {
      setActiveFileId(id);
      if (!openedFileIds.includes(id)) {
        setOpenedFileIds([...openedFileIds, id]);
      }
    }
  };
  const deleteFile = (id, path, isLeaf = false) => {
    //删除默认文件夹
    if (defaultKeys.includes(id)) {
      const newFiles = deleteItemById(files, id);
      saveFile2Store(newFiles);
      setFiles(newFiles);
      closeOpenedFile(id);
      clearUnsavedFile(id);
      return;
    }
    if (isLeaf && isLeaf !== 'false') {
      fileHelper.deleteFile(path).then(() => {
        const newFiles = deleteItemById(files, id);
        saveFile2Store(newFiles);
        setFiles(newFiles);
        closeOpenedFile(id);
        clearUnsavedFile(id);
      });
    } else {
      const curFolder = findItemById(files, id);
      const allDeletePath = getChildrenFilePath(curFolder.children);
      Promise.all(
        allDeletePath.map((path) => fileHelper.deleteFile(path))
      ).then(() => {
        const newFiles = deleteItemById(files, id);
        saveFile2Store(newFiles);
        setFiles(newFiles);
        closeOpenedFile(id);
        clearUnsavedFile(id);
      });
    }
  };
  const createNewFile = (fatherId, type, isLeaf, nId) => {
    const newId = nId || shortid.generate();
    const newPath = join(
      `${savedLocation}${type}/`,
      `${newId}${type === 'note' ? '.md' : '.json'}`
    );
    const defalutBody = type === 'note' ? '##### 请输入markdown' : '';
    const folder = isLeaf
      ? {
          path: newPath,
          body: defalutBody,
        }
      : { children: [] };
    const newFile = {
      id: newId,
      title: '',
      key: newId,
      type,
      icon: getIconByFileType(type, isLeaf),
      createAt: moment().valueOf(),
      isLeaf,
      isSync: false,
      isLoaded: true,
      updatedAt: 0,
      ...folder,
    };
    const newFiles = createItemByFatherId(files, fatherId, newFile);
    if (isLeaf) {
      fileHelper.writeFile(newPath, defalutBody).then((res) => {
        setNewFile(newFile);
        setFiles(newFiles);
        // 默认打开 openClickedFile(newId, true, newPath);
        setActiveFileId(newId);
        if (!openedFileIds.includes(newId)) {
          setOpenedFileIds([...openedFileIds, newId]);
        }
      });
    } else {
      setNewFile(newFile);
      setFiles(newFiles);
    }
    setExpandedKeys((keys) => [...keys, fatherId]);
  };
  const renameFile = (id, path, title, type, isLeaf = false) => {
    if (isLeaf) {
      const newPath = `${dirname(path)}/${title}${
        type === 'note' ? '.md' : '.json'
      }`;
      fileHelper.renameFile(path, newPath).then(() => {
        const newFiles = editItemById(files, id, { title, path: newPath });
        // 默认打开 openClickedFile(newId, true, newPath);
        setActiveFileId(id);
        if (!openedFileIds.includes(id)) {
          setOpenedFileIds([...openedFileIds, id]);
        }
        saveFile2Store(newFiles);
        setFiles(newFiles);
        setNewFile(null);
      });
    } else {
      const newFiles = editItemById(files, id, { title });
      saveFile2Store(newFiles);
      setFiles(newFiles);
      setNewFile(null);
    }
  };

  const fileChange = (id, value, autoSave = false) => {
    console.log('fileChange', id, value);
    if (typeof value !== 'string') {
      value = JSON.stringify(value);
    }
    if (value !== activeFile.body) {
      const newFiles = editItemById(files, id, { body: value });
      setFiles(newFiles);
      if (autoSave) {
        saveEditFile();
      } else if (!unsavedFileIds.includes(id)) {
        setUnsavedFileIds([...unsavedFileIds, id]);
      }
    }
  };

  const saveEditFile = () => {
    if (!activeFile) return;
    // console.log('我要开始执行save了');
    const { path, body, title } = activeFile;
    // if (activeFile.type === 'note') {
    // console.log('保存文件，我执行了', path, body);
    if (body === undefined) {
      // message.error('保存异常：内容未定义');
      return Promise.resolve(false);
    }
    return fileHelper.writeFile(path, body).then(() => {
      setUnsavedFileIds(unsavedFileIds.filter((id) => id !== activeFileId));
      if (getAutoSync()) {
        ipcRenderer.send('upload-file', {
          key: `${title}.md`,
          path: path,
        });
      }
    });
    // }
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
    // // console.log('activeFileDownloaded++++', data);
    const curFile = findItemById(files, data.id);
    // // console.log('activeFileDownloaded++++', curFile.path);
    fileHelper.readFile(curFile.path).then((value) => {
      // // console.log('readFile++++++', value);
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
      // // console.log('activeFileDownloaded', newData);
      const newFiles = editItemById(files, data.id, newData);
      setFiles(newFiles);
      saveFile2Store(newFiles);
    });
  };

  const handleDrag = (_, ui) => {
    const dragWidth = ui.x + defaultSiderWidth;
    setSiderWidth(dragWidth);
  };

  useIpcRenderer({
    'active-file-uploaded': activeFileUploaded,
    'file-downloaded': activeFileDownloaded,
    'save-edit-file': saveEditFile,
  });
  console.log('activeFileId', activeFile, files);
  return (
    <div className={styles.App}>
      <div style={{ height: '100%', display: 'flex' }}>
        <div
          style={{
            width: siderWidth,
            background: '#6E6E6E',
            color: 'white',
            minWidth: siderWidth,
            position: 'relative',
          }}
        >
          <div className={styles.dragArea} />
          <FileSearch
            title=""
            onFileSearch={(val) => {
              // console.log(val);
            }}
          />
          <FileList
            activeId={activeFileId}
            files={deepClone(files)}
            newFile={newFile}
            expanded={{ expandedKeys, setExpandedKeys }}
            // openedFiles={openedFiles}
            onImportFiles={onImportFiles}
            closeOpenedFile={closeOpenedFile}
            unsavedFileIds={unsavedFileIds}
            onFileClick={saveBeforSwitchFile}
            createNewFile={createNewFile}
            onFileDelete={deleteFile}
            onFileRename={renameFile}
          />
          <Draggable
            axis="x"
            bounds={{
              left: miniSiderWidth - defaultSiderWidth,
              right: maxSiderWidth - defaultSiderWidth,
            }}
            defaultPosition={{ x: 0, y: 0 }}
            onDrag={handleDrag}
          >
            <div className={styles.handle} />
          </Draggable>
        </div>
        <div
          style={{ flex: 1, backgroundColor: '#fafbfc', overflow: 'hidden' }}
        >
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
                  position: 'relative',
                }}
              >
                {unsavedFileIds.includes(activeFileId) && (
                  <span className={styles.unsaveIcon} />
                )}
                {activeFile.title || ''}
              </h1>
              {activeFile.type === 'todo' ? (
                <Todo activeFile={activeFile} onChange={fileChange} />
              ) : activeFile.type === 'note' ? (
                <Note activeFile={activeFile} onChange={fileChange} />
              ) : activeFile.type === 'aim' ? (
                <Aim activeFile={activeFile} onChange={fileChange} />
              ) : activeFile.type === 'music' ? (
                <Music activeFile={activeFile} onChange={fileChange} />
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
