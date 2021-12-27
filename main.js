const { app, Menu, ipcMain, dialog } = require('electron');
const isDev = require('electron-is-dev');
const menuTemplate = require('./src/menuTemplate');
const AppWindow = require('./src/AppWindow');
const Store = require('electron-store');
const QiniuManager = require('./src/utils/QiniuManager');
const path = require('path');

const settingsStore = new Store({ name: 'settings' });
let mainWindow, newWindow;

const createManager = () => {
  const accessKey = settingsStore.get('accessKey');
  const secretKey = settingsStore.get('secretKey');
  const bucket = settingsStore.get('bucket');
  return new QiniuManager(accessKey, secretKey, bucket);
};

app.on('ready', () => {
  const mainWindowConfig = {
    width: 1200,
    height: 768,
  };
  const mainUrlLocation = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, './dist/index.html')}`;
  mainWindow = new AppWindow(mainWindowConfig, mainUrlLocation);
  mainWindow.on('close', () => {
    mainWindow = null;
  });

  // main event
  ipcMain.on('open-new-window', (_, path) => {
    console.log('opne-new-window-ipcrenderer', path);
    if (newWindow) {
      newWindow.close();
    }
    const newWindowConfig = {
      width: 500,
      height: 400,
      parent: mainWindow,
    };
    const settingsUrlLocation = `http://localhost:3000/${path}`; // `file://${path.join(__dirname,'./settings.html')}`
    newWindow = new AppWindow(newWindowConfig, settingsUrlLocation);
    if (path === 'settings') {
      newWindow.removeMenu();
    }
    newWindow.on('close', () => {
      newWindow = null;
    });
  });

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  ipcMain.on('menu-config-uploaded', () => {
    let qiniuMenu =
      process.platform === 'darwin' ? menu.items[3] : menu.items[2];
    const switchItems = (toggle) => {
      [1, 2, 3].forEach((num) => {
        qiniuMenu.submenu.items[num].enabled = toggle;
      });
    };
    const qiniuIsConfiged = ['accessKey', 'secretKey', 'bucket'].every(
      (key) => !!settingsStore.get(key)
    );
    switchItems(qiniuIsConfiged);
  });

  ipcMain.on('upload-file', (_, data) => {
    const manager = createManager();
    console.log('upload=====', data.key);
    manager
      .uploadFile(data.key, data.path)
      .then((data) => {
        console.log('上传成功.....');
        mainWindow.webContents.send('active-file-uploaded');
      })
      .catch((err) => {
        dialog.showErrorBox('同步失败', '请检查七牛云参数是否正确');
      });
  });
  ipcMain.on('download-file', (_, data) => {
    const manager = createManager();
    console.log('download-file==ipcMain', data);
    manager.getStat(data.key).then(
      (resp) => {
        console.log('download-file-resp', resp);
        const qiniuUpdateTime = Math.floor(resp.putTime / 10000);
        if (!data.updatedAt || data.updatedAt < qiniuUpdateTime) {
          manager.downloadFile(data.key, data.path).then(() => {
            mainWindow.webContents.send('file-downloaded', {
              status: 'downloaded-success',
              id: data.id,
            });
          });
        } else {
          mainWindow.webContents.send('file-downloaded', {
            status: 'no-new-file',
            id: data.id,
          });
        }
        // todo 本地更新时间和七牛putTime比较
      },
      (err) => {
        if (err.statusCode === 612) {
          mainWindow.webContents.send('file-downloaded', {
            status: 'no-file',
            id: data.id,
          });
        }
        console.log('download-file-error', err);
      }
    );
  });
});
