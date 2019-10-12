import {THooks} from '~/shared/hooks';

const path    = require('path');
const fs      = require('fs');
const debug   = require('~/shared/log').debug('main:plugin');
debug.enabled = true;
const {app}   = require('electron');
/**
export  function initPlugins_CJS(Hooks: THooks) {
  // JuniperW1.init(Hooks);
  debug('init plugins ...');
  try {
    const plugins: string[] = JSON.parse(fs.readFileSync(app.getAppPath() + '/dist/main/main-plugins.json', 'utf8'));
    plugins.forEach(async p => {
         debug(`importing "${p}"`);
         // let PA = await import (p);
         // PA.default.initMain();
      try {

          let m = require(p);
        m.initMain(Hooks);
        debug(`module "${p}" inited`)
      } catch (e) {
        debug(`ERROR on plugin module "${p}"`, e.message)
      }

    });

  } catch (e) {
    debug(`Skipping  plugins: `, e.message)
  }
}
*/
export  function initPlugins(Hooks: THooks) {
  // JuniperW1.init(Hooks);
  debug('init plugins...');
  try {
    const plugins: string[] = JSON.parse(fs.readFileSync(app.getAppPath() + '/dist/main/main-plugins.json', 'utf8'));
    plugins.forEach(async p => {
      debug(`importing "${p}"`);
      // const s =;
      let PA = await import ( "ngnms-plugin/main");
      console.debug(PA);
      PA.default.initMain();
      // try {
      //
      //   let m = require(p);
      //   m.initMain(Hooks);
      //   debug(`module "${p}" inited`)
      // } catch (e) {
      //   debug(`ERROR on plugin module "${p}"`, e.message)
      // }

    });

  } catch (e) {
    debug(`Skipping  plugins: `, e.message)
  }
}
