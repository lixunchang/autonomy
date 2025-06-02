import React, { useState, useEffect, useRef } from "react";
import { Input, Tree } from "antd";
import { getChildNode } from "../utils/helper.js";
import {
  noDeleteKeys,
  noInportKeys,
  switchFileIcons,
} from "../utils/treeHelper";
import styles from "./FileList.less";
import useContextMenu from "../hooks/useContextMenu";
import useIpcRenderer from "../hooks/useIpcRenderer";

const { ipcRenderer } = window.require("electron");

const { DirectoryTree } = Tree;
const FileList = ({
  activeId,
  files,
  newFile,
  onFileClick,
  expanded,
  createNewFile,
  onDropEnd,
  onFileDelete,
  onFileRename,
  onImportFiles,
}) => {
  const [editStatus, setEditStatus] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [selectKey, setSelectKey] = useState([activeId]);
  const { expandedKeys, setExpandedKeys } = expanded;

  const inputRef = useRef(null);

  const handleSaveInput = (path, type, isLeaf) => {
    if (!inputValue) {
      return;
    }
    onFileRename(editStatus, path, inputValue, type, isLeaf);
    if (isLeaf) {
      setSelectKey([editStatus]);
    }
    setEditStatus("");
    setInputValue("");
  };
  const clickItem = useContextMenu(
    [
      {
        label: "新建笔记",
        click: () => {
          const { current = { childNodes: [] } } = clickItem;
          if (current !== null) {
            const childNode = getChildNode(current.childNodes, "file-item");
            const { id } = childNode.dataset;
            createNewFile(id, "note", true);
          }
        },
      },
      {
        label: "新建待办",
        click: () => {
          const { current = { childNodes: [] } } = clickItem;
          if (current !== null) {
            const childNode = getChildNode(current.childNodes, "file-item");
            const { id } = childNode.dataset;
            createNewFile(id, "todo", true);
          }
        },
      },
      {
        label: "新建相册",
        click: () => {
          const { current = { childNodes: [] } } = clickItem;
          if (current !== null) {
            const childNode = getChildNode(current.childNodes, "file-item");
            const { id } = childNode.dataset;
            createNewFile(id, "album", true);
          }
        },
      },
      {
        label: "新建打卡",
        click: () => {
          const { current = { childNodes: [] } } = clickItem;
          if (current !== null) {
            const childNode = getChildNode(current.childNodes, "file-item");
            const { id } = childNode.dataset;
            createNewFile(id, "aim", true);
          }
        },
      },
      {
        type: "separator",
      },
      {
        label: "新建文件夹",
        click: () => {
          const { current = { childNodes: [] } } = clickItem;
          if (current !== null) {
            const childNode = getChildNode(current.childNodes, "file-item");
            const { id, type } = childNode.dataset;
            createNewFile(id, type, false);
          }
        },
      },
      {
        type: "separator",
      },
      {
        label: "重命名",
        click: () => {
          const { current = { childNodes: [] } } = clickItem;
          if (current !== null) {
            const { dataset } = getChildNode(current.childNodes, "file-item");
            setEditStatus(dataset.id);
            setInputValue(dataset.title);
          }
        },
      },
      {
        type: "separator",
      },
      {
        label: "导入PDF书籍",
        click: () => {
          const { current = { childNodes: [] } } = clickItem;
          if (current !== null) {
            const childNode = getChildNode(current.childNodes, "file-item");
            const { id, type, isleaf } = childNode.dataset;
            console.log("导入pdf", type, id, isleaf);
            if (!isleaf || noInportKeys.includes(id)) {
              return;
            }
            onImportFiles(id, type, {
              extension: ["pdf"],
              title: "选择导入PDF书籍",
            });
          }
        },
      },
      {
        label: "导入笔记",
        click: () => {
          const { current = { childNodes: [] } } = clickItem;
          if (current !== null) {
            const childNode = getChildNode(current.childNodes, "file-item");
            const { id, type, isleaf } = childNode.dataset;
            if (!isleaf || noInportKeys.includes(id)) {
              return;
            }
            onImportFiles(id, type);
          }
        },
      },
      {
        label: "复制文件路径",
        click: () => {},
      },
      {
        type: "separator",
      },
      {
        label: "移至回收站",
        click: () => {
          const { current = { childNodes: [] } } = clickItem;
          if (current !== null) {
            const { dataset } =
              getChildNode(current.childNodes, "file-item") || {};
            if (!dataset) {
              return;
            }
            const { id, path, isleaf } = dataset;
            if (noDeleteKeys.includes(id)) {
              return;
            }
            setEditStatus("");
            onFileDelete(id, path, isleaf);
          }
        },
      },
    ],
    "ant-tree-treenode",
  );
  useEffect(() => {
    if (newFile) {
      setEditStatus(newFile.id);
      setInputValue(newFile.title);
      setTimeout(() => {
        inputRef.current.focus();
        console.log("input-focus");
      }, 500);
    }
  }, [newFile]);

  const allowDrop = ({ dropNode, dropPosition }) => {
    if (dropPosition === 0) {
      return !dropNode.isLeaf;
    }

    console.log("allowDrop", dropNode, dropPosition);
    return true;
  };

  const onItemClick = (isLeaf, id, path, isLoaded, type) => {
    // 快速判断设置节点
    if (type === 'setting') {
      ipcRenderer.send('open-new-window', 'setting');
      console.log('open setting');
      return;
    }
    
    if (!isLeaf) {
      return;
    }

    switch (type) {
      case 'crash':
        ipcRenderer.send('open-new-window', 'crash');
        break;
      default:
        onFileClick(id, isLoaded, path);
        break;
    }
  };

  useIpcRenderer({
    "create-new-todo": () => createNewFile("todo", "todo", true),
    "create-new-note": () => createNewFile("note", "note", true),
    "create-new-aim": () => createNewFile("aim", "aim", true),
    "create-new-account": () => createNewFile("account", "account", true),
  });
  // console.log('file', files);
  return (
    <div className={styles.FileList}>
      <DirectoryTree
        style={{
          background: "#6E6E6E",
          color: "white",
        }}
        draggable={{
          icon: false,
        }}
        allowDrop={allowDrop}
        onDrop={onDropEnd}
        defaultExpandAll={false}
        expandedKeys={expandedKeys}
        selectedKeys={selectKey}
        selectable={true}
        onSelect={(key, { node }) => {
          if (editStatus) return;
          const { isLeaf, id, path, isLoaded, type } = node;
          setSelectKey(key);
          onItemClick(isLeaf, id, path, isLoaded, type);
        }}
        onExpand={(keys) => {
          setExpandedKeys(keys);
        }}
        treeData={switchFileIcons(files)}
        titleRender={({ key, title, id, type, isLeaf, isLoaded, path }) => {
          return (
            <div
              key={key}
              className={`${styles.treeItem} ${
                type !== "crash" && type !== "import" ? "file-item" : ""
              }`}
              // data-isloaded={isLoaded}
              data-isleaf={isLeaf} //
              data-title={title}
              data-type={type}
              data-path={path}
              data-id={id}
            >
              {editStatus === id ? (
                <Input
                  ref={inputRef}
                  autoFocus
                  placeholder="请输入"
                  value={inputValue}
                  onBlur={() => handleSaveInput(path, type, isLeaf)}
                  onPressEnter={() => {
                    handleSaveInput(path, type, isLeaf);
                  }}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              ) : (
                <span>{title || "未命名文件"}</span>
              )}
            </div>
          );
        }}
      />
    </div>
  );
};

export default FileList;