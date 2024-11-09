const Store = window.require('electron-store');
const { remote } = window.require('electron');
const isDev = window.require('electron-is-dev');

const settingStore = new Store({
  name: isDev ? 'Settings_dev' : 'Settings',
});

export const getParentNode = (node, parentClassName) => {
  let current = node;
  while (current !== null) {
    const { classList } = current;
    if (classList && classList.contains(parentClassName)) {
      return current;
    }
    current = current.parentNode;
  }
  return false;
};

export const getChildNode = (children = [], childClassName) => {
  for (let i = 0; i < children.length; i++) {
    const { classList } = children[i];
    if (classList && classList.contains(childClassName)) {
      return children[i];
    }
    const result = getChildNode(children[i].childNodes, childClassName);
    if (result) {
      return result;
    }
  }
};

// fileStore.delete('files');
export const getSaveLocation = () => {
  const savePath = isDev ? 'Autonomy_dev' : 'Autonomy';
  return (
    settingStore.get('savedFileLocation') ||
    `${remote.app.getPath('documents')}/${savePath}`
  );
};

export const getAutoSync = () =>
  ['accessKey', 'secretKey', 'bucket', 'enableAutoSync'].every(
    (key) => !!settingStore.get(key)
  );
