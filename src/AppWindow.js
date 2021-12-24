const { BrowserWindow, protocol } = require('electron');

class AppWindow extends BrowserWindow {
  constructor(config, urlLocation) {
    const baseConfig = {
      width: 800,
      minWidth: 600,
      height: 600,
      // frame:false,
      titleBarStyle: 'hidden',
      webPreferences: {
        javascript: true,
        plugins: true,
        nodeIntegration: true, // 是否集成 Nodejs
        enableRemoteModule: true,
        webSecurity: false,
        // contextIsolation: false,
      },
      // show: false,
      backgroundColor: '#efefef',
    };
    const finalConfig = { ...baseConfig, ...config };
    super(finalConfig);
    this.loadURL(urlLocation);
    this.once('ready-to-show', () => {
      this.show();
    });
    //===========自定义file:///协议的解析=======================
    protocol.interceptFileProtocol(
      'file',
      (req, callback) => {
        const url = req.url.substr(8);
        callback(decodeURI(url));
      },
      (error) => {
        if (error) {
          console.error('Failed to register protocol');
        }
      }
    );
  }
}

module.exports = AppWindow;
