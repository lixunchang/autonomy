import { useState, useEffect } from "react";
import styles from "./App.less";
import moment from "moment";
import FileSearch from "./components/FileSearch";
import FileList from "./components/FileList";
import Note from "./note";
import Todo from "./todo";
import Aim from "./aim";
import { ConfigProvider, Dropdown } from "antd";
// import zhCN from 'antd/locale/zh_CN';
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
  deepTree,
  moveDeleteItemToCache,
  defaultAutonomyNode,
} from "./utils/treeHelper";
import emptyImg from "../public/empty.png";
import shortid from "shortid";
import fileHelper from "./utils/fileHelper";
import useIpcRenderer from "./hooks/useIpcRenderer";
import Draggable from "react-draggable";
import { getSaveLocation, getAutoSync } from "./utils/helper.js";
import Music from "./music";
import { DEFAULT_NOTE } from "./components/SlateEditor/constant.js";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import Book from "./book/index.jsx";
import Report, { REPORT_TYPE } from './todo/components/Report';
import { CaretLeftOutlined, CaretRightOutlined } from "@ant-design/icons";

// Node API
const isDev = require("electron-is-dev");
const pdfjsLib = require("pdfjs-dist");
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
// const fs = require('fs');
const { remote, ipcRenderer } = window.require("electron");
const { join, basename, extname, dirname } = window.require("path");
const Store = window.require("electron-store");

const fileStore = new Store({ name: isDev ? "Dev Data" : "Files Data" });
// fileStore.set('files', defaultFiles); //重置操作 22.14.13

const savedLocation = getSaveLocation();

const defaultSiderWidth = 260;
const miniSiderWidth = 190;
const maxSiderWidth = 360;

const reportTypes = Object.entries(REPORT_TYPE).map(([key, label]) => ({
  key,
  label
}));

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
    fileStore.get("files") && fileStore.get("files").length > 0
      ? fileStore.get("files")
      : defaultFiles,
  );
  console.log("files==>", files);
  console.log("remote.app.getPath", remote.app.getPath("userData"));
  const [activeFileId, setActiveFileId] = useState(
    fileStore.get("activeFileId"),
  );
  const [openedFileIds, setOpenedFileIds] = useState([]);
  const [siderClose, setSiderClose] = useState(false);
  const [unsavedFileIds, setUnsavedFileIds] = useState([]);
  const [newFile, setNewFile] = useState(null);
  const [siderWidth, setSiderWidth] = useState(defaultSiderWidth);
  const [reportType, setReportOpen] = useState("none");
  const [expandedKeys, setExpandedKeys] = useState(
    fileStore.get("expandedKeys") || [],
  );

  useEffect(() => {
    if (fileStore) {
      fileStore.set("expandedKeys", expandedKeys || []);
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
    if (fileStore && activeFileId) {
      fileStore.set("activeFileId", activeFileId);
    }
  }, [activeFileId]);

  const saveFile2Store = (data) => {
    const newData = deleteExtraAttr(deepClone(data));
    newData && fileStore.set("files", newData);
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
      setActiveFileId("");
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
        ipcRenderer.send("download-file", {
          key: `${curFile.title}.md`,
          path: curFile.path,
          id: curFile.id,
          updatedAt: curFile.updatedAt,
        });
      } else {
        if (!isExists) {
          fileHelper.writeFile(path, "").then(() => {
            const newFiles = editItemById(files, id, {
              body: "",
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
      if (newFiles.length <= 2) {
        newFiles.push(defaultAutonomyNode);
      }
      saveFile2Store(newFiles);
      setFiles(newFiles);
      closeOpenedFile(id);
      clearUnsavedFile(id);
      return;
    }
    if (isLeaf && isLeaf !== "false") {
      fileHelper.deleteFile(path).then(() => {
        const cacheFiles = moveDeleteItemToCache(files, id);
        const newFiles = deleteItemById(cacheFiles, id);
        saveFile2Store(newFiles);
        setFiles(newFiles);
        closeOpenedFile(id);
        clearUnsavedFile(id);
      });
    } else {
      const curFolder = findItemById(files, id);
      const allDeletePath = getChildrenFilePath(curFolder.children);
      Promise.all(
        allDeletePath.map((path) => fileHelper.deleteFile(path)),
      ).then(() => {
        const cacheFiles = moveDeleteItemToCache(files, id);
        const newFiles = deleteItemById(cacheFiles, id);
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
      `${savedLocation}/${type}/`,
      `${newId}.json`, //${type === 'note' ? '.md' : '.json'}
    );

    const defalutBody = type === "note" ? JSON.stringify(DEFAULT_NOTE) : "";

    const folder = isLeaf
      ? {
          path: newPath,
          body: defalutBody,
        }
      : { children: [] };
    const newFile = {
      id: newId,
      title: "",
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
        type === "note" ? ".md" : ".json"
      }`;
      fileHelper.renameFile(path, newPath).then(() => {
        const newFiles = editItemById(files, id, { title, path: newPath });
        // 默认打开 openClickedFile(newId, true, newPath);
        console.log("newFiles==", newFiles);
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

  const handleDropEnd = (info) => {
    console.log(info);
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split("-");
    const dropPosition =
      info.dropPosition - Number(dropPos[dropPos.length - 1]); // the drop position relative to the drop node, inside 0, top -1, bottom 1

    const loop = (data, key, callback) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].key === key) {
          return callback(data[i], i, data);
        }
        if (data[i].children) {
          loop(data[i].children, key, callback);
        }
      }
    };
    const data = [...files];

    // Find dragObject
    let dragObj;
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });
    if (!info.dropToGap) {
      // Drop on the content
      loop(data, dropKey, (item) => {
        item.children = item.children || [];
        // where to insert. New item was inserted to the start of the array in this example, but can be anywhere
        item.children.unshift(dragObj);
      });
    } else {
      let ar = [];
      let i;
      loop(data, dropKey, (_item, index, arr) => {
        ar = arr;
        i = index;
      });
      if (dropPosition === -1) {
        // Drop on the top of the drop node
        ar.splice(i, 0, dragObj);
      } else {
        // Drop on the bottom of the drop node
        ar.splice(i + 1, 0, dragObj);
      }
    }
    saveFile2Store(data);
    setFiles(data);
  };

  const fileChange = (id, value, info, autoSave = false) => {
    if (typeof value !== "string") {
      value = JSON.stringify(value);
    }
    if (
      value !== activeFile.body ||
      JSON.stringify(info || {}) !== JSON.stringify(activeFile.info)
    ) {
      const newFiles = editItemById(files, id, {
        body: value,
        ...(info || {}),
      });
      setFiles(newFiles);
      if (info) {
        saveFile2Store(newFiles);
      }
      if (autoSave) {
        saveEditFile();
      } else if (!unsavedFileIds.includes(id)) {
        setUnsavedFileIds([...unsavedFileIds, id]);
      }
    }
  };

  const saveEditFile = () => {
    const activeFile = findItemById(files, activeFileId);
    if (!activeFile) return;
    // console.log('我要开始执行save了');
    const { path, body, title } = activeFile;
    // if (activeFile.type === 'note') {
    // console.log('保存文件，我执行了', path, body);
    if (!body) {
      // message.error('保存异常：内容未定义');
      return Promise.resolve(false);
    }
    return fileHelper.writeFile(path, body).then(() => {
      setUnsavedFileIds(unsavedFileIds.filter((id) => id !== activeFileId));
      if (getAutoSync()) {
        ipcRenderer.send("upload-file", {
          key: `${title}.md`,
          path: path,
        });
      }
    });
    // }
  };

  const onImportFiles = (id, type, dialogCfg = {}) => {
    const { extension = ["md"], title = "选择导入MD文档" } = dialogCfg;
    remote.dialog
      .showOpenDialog({
        title,
        filters: [{ name: "Markdown Files", extension }],
        properties: ["openFile", "multiSelections"],
      })
      .then(async ({ filePaths }) => {
        if (Array.isArray(filePaths)) {
          // TODO 过滤已经添加过的文件
          const children = filePaths.map((path) => {
            let newId = shortid.generate();
            const isBook = path.endsWith(".pdf");
            const title = basename(path, extname(path));
            let lastPath = path;

            if (isBook) {
              newId = "book_" + newId;
              lastPath = join(
                `${savedLocation}/pdf-books/`,
                title + extname(path),
              );
              fileHelper.copyFile(
                path,
                `${savedLocation}/pdf-books/`,
                title + extname(path),
              );
            } else {
              newId = "import_" + newId;
            }
            console.log("----1111---", newId, lastPath);
            return {
              id: newId,
              key: newId,
              ...(isBook
                ? {
                    type: "book",
                    pdf: lastPath,
                    path: join(`${savedLocation}/${type}/`, `${newId}.json`),
                  }
                : { type, path }),
              title,
              icon: getIconByFileType(type, true),
              createAt: moment().valueOf(),
              isLeaf: true,
              isSync: false,
              updatedAt: 0,
            };
          });
          // const newFiles = importChildren(files, id, children);
          const newFiles = deepTree(files, (item) => {
            if (item.id === id) {
              return {
                ...item,
                children: [...item.children, ...children],
              };
            }
          });
          console.log("new-files", files, id, children, newFiles);
          saveFile2Store(newFiles);
          setFiles(newFiles);
          if (children.length > 0) {
            remote.dialog.showMessageBox({
              type: "info",
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
      if (data.status === "downloaded-success") {
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

  const handleCloseSider = () => {
    setSiderClose(!siderClose);
  };

  useIpcRenderer({
    "active-file-uploaded": activeFileUploaded,
    "file-downloaded": activeFileDownloaded,
    "save-edit-file": saveEditFile,
  });
  // console.log('activeFileId', activeFile, files, JSON.stringify(files));
  return (
    <div className={styles.App}>
      <div style={{ height: "100%", display: "flex" }}>
        <div
          style={{
            width: siderWidth,
            background: "#6E6E6E",
            color: "white",
            minWidth: siderWidth,
            position: "relative",
          }}
          className={`${styles.siderBar} ${siderClose ? styles.sider_hide : styles.sider_show}`}
        >
          {!siderClose && (
            <>
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
                onDropEnd={handleDropEnd}
                onFileDelete={deleteFile}
                onFileRename={renameFile}
              />
            </>
          )}
          <Draggable
            axis="x"
            bounds={{
              left: miniSiderWidth - defaultSiderWidth,
              right: maxSiderWidth - defaultSiderWidth,
            }}
            defaultPosition={{ x: 0, y: 0 }}
            onDrag={handleDrag}
          >
            <div
              className={styles.handle}
              style={siderClose ? { left: "0px" } : {}}
            >
              <span
                className={styles.actions}
                onClick={handleCloseSider}
                style={siderClose ? { display: "inline-flex" } : {}}
              >
                {siderClose ? <CaretRightOutlined /> : <CaretLeftOutlined />}
              </span>
            </div>
          </Draggable>
        </div>
        <div
          style={{ flex: 1, backgroundColor: "#fafbfc", overflow: "hidden" }}
        >
          {!activeFile ? (
            <div className={styles.empty}>
              <div
                style={{ width: "100%", position: "absolute", top: 0 }}
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
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 58,
                  padding: "0 58px",
                  fontSize: 26,
                  fontWeight: 600,
                  margin: 0,
                  backgroundColor: "#fafbfc",
                  position: "relative",
                }}
              >
                {unsavedFileIds.includes(activeFileId) && (
                  <span className={styles.unsaveIcon} />
                )}
                {activeFile.title || ""}
                {/* <Dropdown
                  menu={{
                    items: reportTypes,
                    onClick: onMenuClick
                  }}> */}
                {activeFile.type === "todo" && (
                  <Dropdown
                    menu={{
                      items: [
                        ...reportTypes.map(item => ({
                          key: item.key,
                          label: `生成${item.label}`
                        }))
                      ],
                      onClick: ({ key }) => setReportOpen(key)
                    }}
                  >
                    <span className={styles.report_text}>
                      生成报告
                    </span>
                  </Dropdown>
                )}
                {/* </Dropdown> */}
              </h1>
              {activeFile.type === "todo" ? (
                <Todo activeFile={activeFile} onChange={fileChange} />
              ) : activeFile.type === "note" ? (
                <Note activeFile={activeFile} onChange={fileChange} />
              ) : activeFile.type === "book" ? (
                <Book activeFile={activeFile} onChange={fileChange} />
              ) : activeFile.type === "aim" ? (
                <Aim activeFile={activeFile} onChange={fileChange} />
              ) : activeFile.type === "music" ? (
                <Music activeFile={activeFile} onChange={fileChange} />
              ) : (
                <div className={styles.empty}>
                  <h3 style={{ color: "red" }}>
                    {activeFile.title}, 正在开发中...
                  </h3>
                </div>
              )}
            </>
          )}
        </div>
        {reportType !== "none" && (
          <Report
            type={reportType}
            activeFile={activeFile}
            closeReport={() => {
              setReportOpen("none");
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;
