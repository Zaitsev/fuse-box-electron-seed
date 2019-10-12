/**
 * Uninstall?  https://github.com/MarshallOfSound/electron-devtools-installer/issues/61
 * For Windows you can remove the extension folder of electron inside appdata
 "%appdata%\Roaming\Electron\extensions". On Linux and Mac this should be in the representative dotfile folders.
 */
const isDev = process.env.NODE_ENV === 'development';
console.log(`---------------- ${isDev} ---------------------`)
//TODO follow https://github.com/MarshallOfSound/electron-devtools-installer/issues
// import installExtension, { REACT_DEVELOPER_TOOLS } from "electron-devtools-installer";
const {app} = require('electron');

export function installExtensions(): Promise<any> {
  if (isDev) {
    const forceDownload = process.env.UPGRADE_EXTENSIONS === 'true';
    console.log(`Development mode, '${forceDownload ? 'Re-installing' : 'Installing'} dev-extensions, `);
    try {
      require('devtron').install();
      const installer  = require('electron-devtools-installer'); // eslint-disable-line global-require
      const extensions = [
        'REACT_DEVELOPER_TOOLS',
        'REDUX_DEVTOOLS',
      ];
      return Promise.all([
                           ...extensions.map(name => installer.default(installer[name], forceDownload)),
                         ]).catch(e => console.error(e));
    } catch (e) {
      console.error(e);
    }
    return Promise.resolve([]);

  }else{
    // require('devtron').uninstall();
  }

  return Promise.resolve([]);
}
