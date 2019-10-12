const settings = require('electron-settings');

let ti:any;
let win:any;

export function init (mainWin:any) {
  win = mainWin;

  win.on('resize', saveWindowBounds);
  win.on('move', saveWindowBounds);
}

export function get () {
  return settings.get('window') || {
    width: 800,
    height: 600
  };
}

function saveWindowBounds () {
  clearTimeout(ti);
  ti = setTimeout(() => {
    settings.set('window', win.getBounds());
  }, 1000);
}
