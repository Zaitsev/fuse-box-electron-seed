import * as windowBounds   from './windowBounds';
import {installExtensions} from './devTools/tools';
import {format}            from 'url';
import {join}              from 'path';
import {stringify}         from 'querystring';
import {Hooks}             from '~/shared/hooks/hooks';
import {initPlugins}       from '~/shared/hooks/main';

const isDev = process.env.NODE_ENV === 'development';

const path                          = require('path');
const url                           = require('url');
const {app, BrowserWindow, ipcMain} = require('electron'); // Module to control application life.
// app.commandLine.appendSwitch('use-angle', 'gl');
app.commandLine.appendSwitch('use-cmd-decoder', 'passthrough');
app.commandLine.appendSwitch('enable-webgl2-compute-context');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-raf-throttling');
// const autoUpdater = require('./autoUpdater') // comming soon
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: any;
const debug   = require('~/shared/log').debug('main:main');
debug.enabled = true;
debug('debug works in main');
console.log('console works in main');
initPlugins(Hooks);

function createWindow() {
  debug('DOm ready');
  if (!isDev) {
    // autoUpdater.checkForUpdates(); // comming soon
  }
  installExtensions().then(() => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
                                     ...windowBounds.get(),
                                     webPreferences: {
                                       nodeIntegration: true,
                                     },
                                     // icon: path.join(__dirname, 'resources', 'icon.png')
                                   });
    windowBounds.init(mainWindow);
    debug('Loading url');
    debug(__dirname);
    debug(app.getAppPath());
    mainWindow.loadURL(url.format({
                                    // pathname: path.join(app.getAppPath(), 'dist', 'renderer', `index.html`),
                                    pathname: path.join(app.getAppPath(), '..', 'renderer', 'index.html'),
                                    protocol: 'file:',
                                    slashes : true
                                  }));

    debug('done');
    if (true || isDev) {
      mainWindow.webContents.openDevTools();
    }

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null;
    });
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

export function createURLParams(hash: string = '', query: Record<string, any>, path = 'renderer/index.html') {
  return format({
                  pathname: join(app.getAppPath(), '..', path),
                  protocol: 'file:',
                  slashes : true,
                  hash,
                  search  : stringify(query),
                });
}

function createNewWindow() {
  let w = new BrowserWindow({
                              webPreferences: {
                                nodeIntegration: true,
                              },
                            });
  w.loadURL(createURLParams('/lazy', {a: 'a-param'}));
  debug('Window opened');
  w.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    w = null as any;
  });
}

function createNewWindowGL() {
  let w = new BrowserWindow({
                              width         : 1200, height: 1200,
                              webPreferences: {
                                devTools       : true,
                                nodeIntegration: true,
                              },
                            });
  w.loadURL(createURLParams('/D3GL', {a: 'a-param'}));
  w.setTitle('GL experiment');
  debug('Window opened');
  w.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    w = null as any;
  });
}

ipcMain.on('create_new_window', createNewWindow);
ipcMain.on('GL_create_new_window_GL', createNewWindowGL);
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
