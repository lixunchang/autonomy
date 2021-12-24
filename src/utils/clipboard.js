import plist from 'plist';
const { remote } = window.require('electron');

export const isOsx = process.platform === 'darwin';
export const isWindows = process.platform === 'win32';
export const isLinux = process.platform === 'linux';

const hasClipboardFiles = () => {
  return remote.clipboard.has('NSFilenamesPboardType');
};

const getClipboardFiles = () => {
  if (!hasClipboardFiles()) {
    return [];
  }
  return plist.parse(remote.clipboard.read('NSFilenamesPboardType'));
};

export const guessClipboardFilePath = () => {
  if (isLinux) return '';
  if (isOsx) {
    const result = getClipboardFiles();
    return Array.isArray(result) && result.length ? result[0] : '';
  } else if (isWindows) {
    const rawFilePath = remote.clipboard.read('FileNameW');
    const filePath = rawFilePath.replace(
      new RegExp(String.fromCharCode(0), 'g'),
      ''
    );
    return filePath && typeof filePath === 'string' ? filePath : '';
  } else {
    return '';
  }
};

const easeInOutQuad = function (t, b, c, d) {
  t /= d / 2;
  if (t < 1) return (c / 2) * t * t + b;
  t--;
  return (-c / 2) * (t * (t - 2) - 1) + b;
};

export const animatedScrollTo = function (element, to, duration, callback) {
  const start = element.scrollTop;
  const change = to - start;
  const animationStart = +new Date();
  let animating = true;
  let lastpos = null;

  const animateScroll = function () {
    if (!animating) {
      return;
    }
    requestAnimationFrame(animateScroll);
    const now = +new Date();
    const val = Math.floor(
      easeInOutQuad(now - animationStart, start, change, duration)
    );
    if (lastpos) {
      if (lastpos === element.scrollTop) {
        lastpos = val;
        element.scrollTop = val;
      } else {
        animating = false;
      }
    } else {
      lastpos = val;
      element.scrollTop = val;
    }
    if (now > animationStart + duration) {
      element.scrollTop = to;
      animating = false;
      if (callback) {
        callback();
      }
    }
  };
  requestAnimationFrame(animateScroll);
};
