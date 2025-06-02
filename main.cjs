const { app, Menu, ipcMain, dialog, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');
const menuTemplate = require('./src/menuTemplate.cjs');
const AppWindow = require('./src/AppWindow.cjs');
const Store = require('electron-store');
const QiniuManager = require('./src/utils/QiniuManager.cjs');
const path = require('path');
const url = require('url');

const settingsStore = new Store({ name: 'settings' });
let mainWindow, newWindow, splashWindow;

const createManager = () => {
  const accessKey = settingsStore.get('accessKey');
  const secretKey = settingsStore.get('secretKey');
  const bucket = settingsStore.get('bucket');
  return new QiniuManager(accessKey, secretKey, bucket);
};

// function showLoadingWindow() {
//   splashWindow = new BrowserWindow({
//     width: 1200,
//     height: 800,
//     frame: false,
//     transparent: true,
//     alwaysOnTop: true
//   });
 
//   splashWindow.loadURL(url.format({
//     pathname: path.join(__dirname, './build/splash.html'),
//     protocol: 'file:',
//     slashes: true
//   }));
// }

// 加载loading页面窗口
const showSplashWindow = () => {
  return new Promise((resolve) => {
    // loadingWindow = new BrowserWindow({
    //   width: 1200,
    //   height: 800,
    //   frame: false, // 无边框（窗口、工具栏等），只包含网页内容
    //   transparent: true, // 窗口是否支持透明，如果想做高级效果最好为true
    //   alwaysOnTop: true
    // });
    // loadingWindow.loadURL(url.format({
    //   pathname: path.join(__dirname, './build/splash.html'),
    //   protocol: 'file:',
    //   slashes: true
    // }));
    // loadingWindow.show()
    const splasUrlLocation = isDev
      ? `http://localhost:3000/#/splash`
      : url.format({
          pathname: path.join(__dirname, '/build/index.html'),
          protocol: 'file:',
          slashes: true,
          hash: 'splash',
        });
    splashWindow = new AppWindow(
      {
        width: 1200,
        height: 800,    
        frame: false, // 无边框（窗口、工具栏等），只包含网页内容
        // transparent: true, // 窗口是否支持透明，如果想做高级效果最好为true
        // alwaysOnTop: false
      },
      splasUrlLocation,
    );

    resolve();
  });
};

const showMainWindow = () => {
   return new Promise((resolve)=>{
      const mainWindowConfig = {
        width: 1200,
        height: 800,
      };
      const mainUrlLocation = isDev
        ? 'http://localhost:3000/'
        : url.format({
            pathname: path.join(__dirname, './build/index.html'),
            protocol: 'file:',
            slashes: true,
          });
      mainWindow = new AppWindow(
        mainWindowConfig, 
        mainUrlLocation, 
        5000,
        ()=>{
          splashWindow.hide();
          splashWindow.close();
        },
      );
      mainWindow.on('close', () => {
        mainWindow = null;
      });
      resolve()
   })
}


app.on('ready', async () => {
  await showSplashWindow();
  await showMainWindow();
 
  // main event
  ipcMain.on('open-new-window', (_, urlPath) => {
    console.log('setting', urlPath);
    if (newWindow) {
      newWindow.close();
    }
    const newWindowConfig = {
      width: 800,
      height: 600,
      parent: mainWindow,
    };
    const settingsUrlLocation = isDev
      ? `http://localhost:3000/#/${urlPath}`
      : url.format({
          pathname: path.join(__dirname, '/build/index.html'),
          protocol: 'file:',
          slashes: true,
          hash: 'setting',
        });
    newWindow = new AppWindow(newWindowConfig, settingsUrlLocation, 1);
    if (urlPath === 'setting') {
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
