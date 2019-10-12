import {isMain} from "./isRenderer";
import {Debug}  from "debug";
import 'source-map-support/register';

let appPath = "";
let Logger: Debug;
if (isMain()) {
  appPath = require('electron').app.getAppPath();
  //windows backslashes breaks String.replace
  appPath = appPath.replace(/\\/g, '|');
  Logger  = require('debug');
} else {
  appPath = require('electron').remote.app.getAppPath();
  Logger  = require('electron').remote.require('debug');
}
export const debug = (path: string, enabled = true) => {
  const _debug    = Logger('');
  _debug.enabled  = enabled;
  const namespace = path;
  return (...args: any[]) => {
    const stack = (new Error()).stack;
    let prefix = `${new Date().toISOString()} | DEBUG |`;
    if (stack) {
      // _debug(stack);
      let [, , callee] = stack.split("\n");

      if (callee) {

        callee = callee.replace(/.+\(file:\/\/\/.+src\/(.+)\)/, `at file:///${appPath}/src/$1`)
                       .replace(/:(\d+):(\d+)/, " line $1")
        ;
        callee = callee.replace(/\\/g, '/');
        args.push(` | ${callee}`);
        // prefix += ` at ${callee} `;
      }
    }
    _debug(prefix, ...args);
  };
};
export const error = (path: string, enabled = true) => {
  const debug   = require('debug')('ERROR ' + path);
  debug.enabled = enabled;
  return debug;
};

export default debug;
